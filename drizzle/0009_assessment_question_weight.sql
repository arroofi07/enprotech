-- Bobot per soal, diatur trainer/admin lewat menu "Bobot Soal".
-- NULL dipertahankan sebagai default agar assessment lama tetap dinilai rata
-- (benar / total * 100); begitu diisi, tiap jawaban benar bernilai persis
-- sebesar bobot ini. numeric(5,2) menampung 2 desimal seperti 2.50.
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "question_weight" numeric(5, 2);
