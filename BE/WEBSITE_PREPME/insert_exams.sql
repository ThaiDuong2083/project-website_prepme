-- SQL script to insert mock exam data for Prepme platform.
-- Each exam category (LISTENING, READING, WRITING, SPEAKING) has 10 exams (5 FREE, 5 PRO).
-- LISTENING & READING: 4 sections, each section has 10 questions (Total 40 questions per exam).
-- WRITING & SPEAKING: 5 sections, each section has 1 question (Total 5 questions per exam).

DO $$
DECLARE
    -- Loop counters
    t_idx INT;
    s_idx INT;
    q_idx INT;
    
    -- IDs
    curr_test_id BIGINT;
    curr_section_id BIGINT;
    
    -- Variables for dynamically generated values
    is_pro_val BOOLEAN;
    duration_val INT;
    q_type_val VARCHAR(30);
    options_val TEXT;
    correct_ans_val VARCHAR(255);
    title_val VARCHAR(255);
    desc_val TEXT;
    sec_title VARCHAR(255);
    passage_val TEXT;
    q_text_val TEXT;
    
    -- List of target exam types
    types_list VARCHAR(20)[] := ARRAY['LISTENING', 'READING', 'WRITING', 'SPEAKING'];
    t_type VARCHAR(20);
BEGIN
    FOREACH t_type IN ARRAY types_list LOOP
        FOR t_idx IN 1..10 LOOP
            -- Determine if test is Pro (5 free [1-5], 5 pro [6-10])
            is_pro_val := (t_idx > 5);
            
            -- Set duration based on type
            IF t_type = 'LISTENING' THEN
                duration_val := 1800;
            ELSIF t_type = 'READING' THEN
                duration_val := 3600;
            ELSIF t_type = 'WRITING' THEN
                duration_val := 3600;
            ELSE -- SPEAKING
                duration_val := 900;
            END IF;
            
            title_val := 'IELTS Practice ' || initcap(t_type) || ' Test ' || t_idx || CASE WHEN is_pro_val THEN ' (PRO)' ELSE ' (FREE)' END;
            desc_val := 'Standard practice exam for ' || lower(t_type) || ' skill, level ' || t_idx || '.';
            
            -- Insert test
            INSERT INTO tests (created_at, is_deleted, title, exam_type, duration, description, is_pro, audio_url)
            VALUES (CURRENT_TIMESTAMP, FALSE, title_val, t_type, duration_val, desc_val, is_pro_val, 
                    CASE WHEN t_type = 'LISTENING' THEN 'https://res.cloudinary.com/dilyyimrn/video/upload/v1700000000/listening_sample.mp3' ELSE NULL END)
            RETURNING id INTO curr_test_id;
            
            -- Speaking/Writing: 5 sections, each has 1 question
            IF t_type = 'WRITING' OR t_type = 'SPEAKING' THEN
                FOR s_idx IN 1..5 LOOP
                    sec_title := 'Section ' || s_idx;
                    
                    INSERT INTO test_sections (created_at, is_deleted, test_id, section_number, title, passage, cue_card)
                    VALUES (CURRENT_TIMESTAMP, FALSE, curr_test_id, s_idx, sec_title, 
                            CASE WHEN t_type = 'WRITING' THEN 'Prompt details for Writing Section ' || s_idx || ' in Test ' || t_idx || '.' ELSE NULL END,
                            CASE WHEN t_type = 'SPEAKING' AND s_idx = 2 THEN 'Cue Card Topic for Test ' || t_idx || ': Describe an interesting trip.' ELSE NULL END)
                    RETURNING id INTO curr_section_id;
                    
                    -- Insert 1 question
                    q_text_val := 'Question details for ' || lower(t_type) || ' Section ' || s_idx || '.';
                    INSERT INTO test_questions (created_at, is_deleted, section_id, question_number, question_type, question_text, correct_answer)
                    VALUES (CURRENT_TIMESTAMP, FALSE, curr_section_id, 1, 
                            'SHORT_ANSWER',
                            q_text_val, 'Sample response answer');
                END LOOP;
                
            -- Listening/Reading: 4 sections, each has 10 questions
            ELSE
                FOR s_idx IN 1..4 LOOP
                    sec_title := 'Section ' || s_idx;
                    
                    INSERT INTO test_sections (created_at, is_deleted, test_id, section_number, title, passage)
                    VALUES (CURRENT_TIMESTAMP, FALSE, curr_test_id, s_idx, sec_title,
                            CASE WHEN t_type = 'READING' THEN '<div><p>Reading passage content for Section ' || s_idx || ' in Test ' || t_idx || '. This passage details academic or general research related to science and environment.</p></div>' ELSE NULL END)
                    RETURNING id INTO curr_section_id;
                    
                    FOR q_idx IN 1..10 LOOP
                        -- Alternate question types
                        IF q_idx % 3 = 0 THEN
                            q_type_val := 'MULTIPLE_CHOICE';
                            options_val := '["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"]';
                            correct_ans_val := 'A';
                        ELSIF q_idx % 3 = 1 THEN
                            q_type_val := 'TRUE_FALSE_NOT_GIVEN';
                            options_val := NULL;
                            correct_ans_val := 'TRUE';
                        ELSE
                            q_type_val := 'FILL_IN_THE_BLANK';
                            options_val := NULL;
                            correct_ans_val := 'answer';
                        END IF;
                        
                        q_text_val := 'Question ' || q_idx || ' text details in Section ' || s_idx || ' of ' || initcap(t_type) || ' Test ' || t_idx;
                        
                        INSERT INTO test_questions (created_at, is_deleted, section_id, question_number, question_type, question_text, options, correct_answer, explanation)
                        VALUES (CURRENT_TIMESTAMP, FALSE, curr_section_id, q_idx, q_type_val, q_text_val, options_val, correct_ans_val, 'Auto-generated explanation.');
                    END LOOP;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END $$;
