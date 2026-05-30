package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.entity.PracticeHistoryEntity;
import com.fpt.website_prepme.model.entity.TestEntity;

public interface OpenAiService {
    
    /**
     * Generates a detailed IELTS feedback assessment, correcting errors and advising improvements.
     * 
     * @param test the test metadata and structure
     * @param practiceHistory the user's practice submission content and scores
     * @return Markdown formatted assessment content
     */
    String generateFeedback(TestEntity test, PracticeHistoryEntity practiceHistory);

    /**
     * Generates and saves AI feedback asynchronously.
     * 
     * @param practiceHistoryId the ID of the practice history to evaluate
     */
    void generateFeedbackAsync(Long practiceHistoryId);

    /**
     * Transcribes an audio recording using OpenAI Whisper API.
     * 
     * @param audioUrl direct HTTP URL of the audio file to transcribe
     * @return transcribed text content
     */
    String transcribeAudio(String audioUrl);
}
