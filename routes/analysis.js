const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');


// Get analysis form
router.get('/new', analysisController.getAnalysisForm);

// Run new analysis
router.post('/run',analysisController.runAnalysis);

// Get analysis results
router.get('/:id',analysisController.getAnalysisResults);

// Get shared analysis
router.get('/share/:token', analysisController.getSharedAnalysis);

// Download analysis report
router.get('/:id/download',analysisController.downloadAnalysis);

module.exports = router;