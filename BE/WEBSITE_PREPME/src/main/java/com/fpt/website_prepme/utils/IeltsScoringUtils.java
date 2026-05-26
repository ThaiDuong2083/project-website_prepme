package com.fpt.website_prepme.utils;

public class IeltsScoringUtils {

    /**
     * Maps raw correct answers (0 - 40) to IELTS Listening Band Scores.
     */
    public static Double calculateListeningBand(int correctAnswers) {
        if (correctAnswers >= 39) return 9.0;
        if (correctAnswers >= 37) return 8.5;
        if (correctAnswers >= 35) return 8.0;
        if (correctAnswers >= 32) return 7.5;
        if (correctAnswers >= 30) return 7.0;
        if (correctAnswers >= 26) return 6.5;
        if (correctAnswers >= 23) return 6.0;
        if (correctAnswers >= 20) return 5.5;
        if (correctAnswers >= 16) return 5.0;
        if (correctAnswers >= 13) return 4.5;
        if (correctAnswers >= 10) return 4.0;
        if (correctAnswers >= 7) return 3.5;
        if (correctAnswers >= 5) return 3.0;
        if (correctAnswers == 4) return 2.5;
        if (correctAnswers == 3) return 2.0;
        if (correctAnswers == 2) return 1.5;
        if (correctAnswers == 1) return 1.0;
        return 0.0;
    }

    /**
     * Maps raw correct answers (0 - 40) to IELTS Reading Academic Band Scores.
     */
    public static Double calculateReadingAcademicBand(int correctAnswers) {
        if (correctAnswers >= 39) return 9.0;
        if (correctAnswers >= 37) return 8.5;
        if (correctAnswers >= 35) return 8.0;
        if (correctAnswers >= 33) return 7.5;
        if (correctAnswers >= 30) return 7.0;
        if (correctAnswers >= 27) return 6.5;
        if (correctAnswers >= 23) return 6.0;
        if (correctAnswers >= 20) return 5.5;
        if (correctAnswers >= 15) return 5.0;
        if (correctAnswers >= 13) return 4.5;
        if (correctAnswers >= 10) return 4.0;
        if (correctAnswers >= 8) return 3.5;
        if (correctAnswers >= 6) return 3.0;
        if (correctAnswers >= 4) return 2.5;
        if (correctAnswers == 3) return 2.0;
        if (correctAnswers == 2) return 1.5;
        if (correctAnswers == 1) return 1.0;
        return 0.0;
    }
}
