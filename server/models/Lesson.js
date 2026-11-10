const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    objectives: [String],
    keyTopics: [String],
    content: { type: [mongoose.Schema.Types.Mixed], default: [] }, // structured blocks
    readings: [{ title: String, url: String }],
    hinglish: String, // cached Hinglish explanation
    isEnriched: { type: Boolean, default: false }, // true once the AI has written the content
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
