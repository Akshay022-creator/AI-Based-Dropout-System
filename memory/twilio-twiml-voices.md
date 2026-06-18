---
name: Twilio TwiML voice compatibility
description: Which Amazon Polly and Google voices work for which languages in Twilio <Say>
---

## Rule
Match `voice` to supported languages exactly — mismatches cause "application error" on the call.

| Language | voice= | language= |
|---|---|---|
| English (Indian) | `Polly.Aditi` | `en-IN` |
| Hindi | `Polly.Aditi` | `hi-IN` |
| Kannada | `Google.kn-IN-Standard-A` | `kn-IN` |

**Why:** `Polly.Aditi` only supports `en-IN` and `hi-IN`. Using it with `kn-IN` causes Twilio "application error". Google Neural voices (`Google.kn-IN-Standard-A`) require the paid Twilio Neural TTS add-on — using them without it also causes "application error". Twilio's `alice` voice also doesn't support `kn-IN`. There is NO free Twilio TTS option for Kannada. Kannada must be delivered via WhatsApp text (not TTS).

**How to apply:** Any time you add a new language to a TwiML `<Say>`, check the Twilio voice/language matrix before choosing a voice attribute.
