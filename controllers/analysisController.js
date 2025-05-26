const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Analysis = require('../models/analysis');

// Helper function to load axe-core script
const axeScript = fs.readFileSync(
  path.resolve(require.resolve('axe-core'), '../axe.min.js'),
  'utf8'
);

exports.getAnalysisForm = (req, res) => {
  res.render('analysis-form.ejs');
};

exports.runAnalysis = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).render('error', { 
        message: 'URL is required',
        error: {}
      });
    }

    // Launch headless browser
    const browser = await puppeteer.launch({ headless: true }); //invisible browser
    const page = await browser.newPage();      //new tab in invisible browser
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    try {
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Inject and run axe-core
      await page.evaluate(axeScript);
      
      // Run the accessibility tests
      const results = await page.evaluate(() => {
        return new Promise((resolve) => {
          axe.run((err, results) => {
            if (err) throw err;
            resolve(results);
          });
        });
      });
      // Calculate statistics
      const stats = {
        violationCount: results.violations.length,
        passCount: results.passes.length,
        incompleteCount: results.incomplete.length,
        criticalIssues: results.violations.filter(v => v.impact === 'critical').length,
        seriousIssues: results.violations.filter(v => v.impact === 'serious').length,
        moderateIssues: results.violations.filter(v => v.impact === 'moderate').length,
        minorIssues: results.violations.filter(v => v.impact === 'minor').length
      };
      
      // Generate share token
      const shareToken = crypto.randomBytes(16).toString('hex');
      
      // Create analysis record
      const analysis = new Analysis({
        url,
        results,
        stats,
        shareToken
      });
      
      await analysis.save();
      await browser.close();
      
      // Redirect to results page
      res.redirect(`/analysis/${analysis._id}`);
      
    } catch (error) {
      await browser.close();
      throw error;
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).render('error', { 
      message: 'Error analyzing website',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

exports.getAnalysisResults = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).render('error', {
        message: 'Analysis not found',
        error: {}
      });
    }
    
    res.render('analysis-results', {
      analysis,
      shareUrl: `${req.protocol}://${req.get('host')}/analysis/share/${analysis.shareToken}`,
      shared:true
    });
    
  } catch (error) {
    console.error('Error retrieving analysis:', error);
    res.status(500).render('error', {
      message: 'Error retrieving analysis results',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

exports.getSharedAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ shareToken: req.params.token });
    
    if (!analysis) {
      return res.status(404).render('error', {
        message: 'Shared analysis not found',
        error: {}
      });
    }

    res.render('analysis-results', {
      title: `Accessibility Analysis for ${analysis.url}`,
      analysis,
     shareUrl: `${req.protocol}://${req.get('host')}/analysis/share/${analysis.shareToken}`,
      shared: true
    });
    
  } catch (error) {
    console.error('Error retrieving shared analysis:', error);
    res.status(500).render('error', {
      message: 'Error retrieving shared analysis',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};




exports.downloadAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).render('error', {
        message: 'Analysis not found',
        error: {}
      });
    }

    // Render the HTML using EJS
    res.render('analysis-results', {
      analysis,
      shared: true,
      shareUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
      layout: false // Optional: avoid default layout if not needed
    }, async (err, htmlContent) => {
      if (err) {
        console.error('Error rendering HTML:', err);
        return res.status(500).render('error', {
          message: 'Error rendering the report',
          error: err
        });
      }

      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Enable network idle to wait until all resources (e.g., map) are fully loaded
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0' // Ensure map scripts/styles fully load
      });

      // Wait specifically for a map container to appear if needed
      await page.waitForSelector('#issuesChart', { timeout: 5000 }).catch(() => {
        console.warn('Map container #map not found or took too long to load.');
      });

      // Give extra time for the map tiles to render (if needed)
      await new Promise(resolve => setTimeout(resolve, 2000));


      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
        preferCSSPageSize: true
      });

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=accessibility-report-${Date.now()}.pdf`);

      return res.send(pdfBuffer);
    });

  } catch (error) {
    console.error('Error downloading analysis:', error);
    if (!res.headersSent) {
      res.status(500).render('error', {
        message: 'Error generating download',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }
};
