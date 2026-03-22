-- ============================================================
-- TRUTH & DARE PICKER – DATABASE SCHEMA v4 (Pure Version)
-- High-speed, minimalist schema for the Neon Fate Wheel.
-- ============================================================

-- 1. Create Tables (Clean & Minimal)
DROP TABLE IF EXISTS cards;
CREATE TABLE cards (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type        TEXT        NOT NULL CHECK (type IN ('truth', 'dare')),
  text        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Performance Index
CREATE INDEX cards_type_idx ON cards(type);

-- 3. RLS Policies
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Select" ON cards FOR SELECT USING (true);

-- 4. Pure Random Selection Function (RPC)
-- Optimized for speed and cleanliness.
CREATE OR REPLACE FUNCTION get_random_card(card_type TEXT)
RETURNS SETOF cards
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM cards
  WHERE type = card_type
  ORDER BY random()
  LIMIT 1;
$$;

-- 5. PURE SEED DATA
INSERT INTO cards (type, text) VALUES
-- TRUTHS
('truth', 'Who is the most boring person in this room, and why?'),
('truth', 'If you had to delete one person here from your life, who would it be?'),
('truth', 'What is the most scandalous thing you have ever done in a car?'),
('truth', 'Have you ever slept with someone just to get over someone else?'),
('truth', 'Who here do you think has the most "hidden" dark side?'),
('truth', 'What is the most expensive thing you have ever broken and didn''t pay for?'),
('truth', 'Have you ever sent a "spicy" photo to the wrong person?'),
('truth', 'What is the meanest thing you’ve ever said to someone’s face?'),
('truth', 'Who in this room is the most likely to betray the group for $10,000?'),
('truth', 'What is the most "illegal" thing you’ve done that you haven''t been caught for?'),
('truth', 'Have you ever "hooked up" with a friend''s ex?'),
('truth', 'Who here is the most attractive person that you actually DISLIKE?'),
('truth', 'What is the biggest lie you have told to stay in a relationship?'),
('truth', 'Have you ever stalked a crush''s new partner on social media for hours?'),
('truth', 'What is the most "unholy" thing you’ve done in a place of worship or school?'),
('truth', 'If you could sleep with one person here and no one would ever know, who is it?'),
('truth', 'Have you ever pretended to be drunk to excuse your behavior?'),
('truth', 'What is the most "toxic" thing you have done to get revenge on an ex?'),
('truth', 'Who in this room do you think is "faking" their personality the most?'),
('truth', 'What is the most embarrassing thing you’ve done while "in the heat of the moment"?'),
('truth', 'Have you ever checked a partner''s DMs while they were in the shower?'),
('truth', 'What is the most "shady" way you have made money?'),
('truth', 'Who do you secretly hope breaks up with their current partner?'),
('truth', 'What is the biggest secret you are keeping from your best friend?'),
('truth', 'Have you ever "double-dipped" (dated two people at the same time) without them knowing?'),

-- =========================
-- SPICY DARES
-- =========================

('dare', 'Let the person to your left send a "Thinking of you" text to your ex.'),
('dare', 'Show the group the last 3 things you searched for in your browser incognito.'),
('dare', 'Call the 10th contact in your phone and tell them you’re "deeply in love" with them.'),
('dare', 'Let someone in the room post a "thirst trap" photo on your story with no context.'),
('dare', 'Whisper something "suggestive" into the ear of the person to your right.'),
('dare', 'Sit on the lap of the person across from you for the next two rounds.'),
('dare', 'Give the person you find most attractive in the room a "meaningful" 10-second hug.'),
('dare', 'Let the group choose a contact for you to send a "breakup" text to (even if you aren''t dating).'),
('dare', 'Lick a small amount of salt off the neck of the person to your left.'),
('dare', 'Swap shirts with the person of the opposite sex in the room right now.'),
('dare', 'Let someone read your last 5 DMs out loud to the group.'),
('dare', 'Take a shot (or drink) off the stomach of the person sitting next to you.'),
('dare', 'Blindfold yourself and let someone in the room feed you something from the kitchen.'),
('dare', 'Call your crush and tell them you had a "dream" about them, then hang up immediately.'),
('dare', 'Let someone in the room draw a "mark" on your face that must stay for the rest of the game.'),
('dare', 'Slow dance with a chair as if it’s the love of your life for 1 minute.'),
('dare', 'Post a photo of the person to your right and caption it "My Secret Crush."'),
('dare', 'Let the group scroll through your "Hidden" or "Deleted" photo album.'),
('dare', 'Remove one item of clothing (not including shoes/socks).'),
('dare', 'Describe, in detail, what the person to your left’s lips probably taste like.'),
('dare', 'Let the person across from you "administer" a 5-second tickle torture.'),
('dare', 'Send a random heart emoji to your boss or a professor.'),
('dare', 'Make out with a pillow for 30 seconds while the group watches.'),
('dare', 'Let someone write "PROPERTY OF [THEIR NAME]" on your arm in permanent marker.'),
('dare', 'Sit under the table for the next 3 rounds and only speak in a "seductive" voice.');
