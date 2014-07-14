const fs = require("fs")
    , spawn = require("child_process").spawn;

module.exports = {
  activate: activate,
  deactivate: deactivate,
  serialize: serialize
};

function CProject(settings) {
  if(typeof settings.buildDir == "string")
    this.buildDir = settings.buildDir;
  if(typeof settings.sourceDir == "string")
    this.sourceDir = settings.sourceDir;
  if(typeof settings.installPrefix == "string")
    this.installPrefix = settings.installPrefix;
}

CProject.prototype = {
  buildDir: "",
  sourceDir: "",
  installPrefix: "",

  configure: function() {
    var cmakeArgs = ["-G", "MinGW Makefiles"];
    if(this.buildDir) {
      cmakeArgs.push("-DCMAKE_BINARY_DIR="+this.buildDir);
    }
    if(this.sourceDir) {
      cmakeArgs.push("-DCMAKE_SOURCE_DIR="+this.buildDir);
    }
    if(this.installPrefix) {
      cmakeArgs.push("-DCMAKE_INSTALL_PREFIX="+this.installPrefix);
    }

    spawn("cmake", cmakeArgs, {
      cwd: process.cwd()
    });
  },

  build: function() {
    var buildDir = this.buildDir || ".";
    spawn("cmake", ["--build", "."], {
      cwd: buildDir
    });
  }

};

function activate(state) {

}

function deactivate() {

}

function serialize() {

}
