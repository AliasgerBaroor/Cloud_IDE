require("../lib/mongodb")
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  // framework: {
  //   type: String,
  //   required: true,
  // },
  language: {
    type: String,
    required: true,
  },
  repoType: {
    type: String,
    required: true,
  },
  stats :
    {
      likes : {
        type: Number,
        required: true,
        default: 0,
      },
      downloads : {
        type: Number,
        required: true,
        default: 0,
      },
    },
  dockerContainerId: {
    type: String,
    required: true,
  },
  commandHistory: [
    {
      command: {
        type: String,
        required: true,
        default : "",
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    authType: {
      type: String,
      enum: ['email', 'google', 'github'],
      required: true,
    },
    googleId: {
      type: String,
    },
    githubId: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    projects: [ProjectSchema],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;
