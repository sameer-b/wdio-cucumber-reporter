'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var esc = {
    sp: ' ',
    nl: '\n'
};

/**
 * Initialize a new `Specs` matrix test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

var CucumberReporter = (function (_events$EventEmitter) {
    _inherits(CucumberReporter, _events$EventEmitter);

    function CucumberReporter(baseReporter, config) {
        var _this = this;

        var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        _classCallCheck(this, CucumberReporter);

        var isFeatureStarted = false;
        var isScenarioStarted = false;
        var reportHTML = '';

        _get(Object.getPrototypeOf(CucumberReporter.prototype), 'constructor', this).call(this);

        this.baseReporter = baseReporter;

        this.on('suite:start', function (p) {
            if (p.parent) {
                _this.printLine('suite', '' + esc.nl + esc.sp + esc.sp + esc.sp + esc.sp + 'Scenario: ' + p.title);

                if (isScenarioStarted) {
                    reportHTML += '</div><div class=\'scenario\'><h4>Scenario: ' + p.title + '</h4>';
                } else {
                    reportHTML += '<div class=\'scenario\'><h4>Scenario: ' + p.title + '</h4>';
                    isScenarioStarted = true;
                }
            } else {
                _this.printLine('medium', '' + esc.nl + esc.sp + esc.sp + 'Feature: ' + p.title);

                if (isFeatureStarted) {
                    reportHTML += '</div></div><div class=\'feature\'><h3>Feature: ' + p.title + '</h3>';
                    isScenarioStarted = false;
                } else {
                    reportHTML += '<div class=\'feature\'><h3>Feature: ' + p.title + '</h3>';
                    isScenarioStarted = false;
                    isFeatureStarted = true;
                }
            }
        });

        this.on('test:pending', function (p) {
            _this.printLine('pending', '' + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + p.title);
            reportHTML += '<div class=\'pending list-group-item-info test\'>[Pending]: ' + p.title + '</div>';
        });

        this.on('test:pass', function (p) {
            _this.printLine('bright pass', '' + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + p.title);
            reportHTML += '<div class=\'pass list-group-item-success test\'>[Pass]: ' + p.title + '</div>';
        });

        this.on('test:fail', function (p) {
            _this.printLine('bright fail', '' + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + p.title);
            _this.printLine('error message', '' + esc.nl + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + p.err.message + esc.nl);
            _this.printLine('error stack', '' + esc.nl + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + esc.sp + p.err.stack + esc.nl);
            reportHTML += '<div class=\'fail list-group-item-danger test\'>[Failed]: ' + p.title + '</div>';
        });

        this.on('test:end', function () {});

        this.on('end', function () {
            reportHTML += '</div></div>';
            _this.writeHTMLReport(reportHTML, options);
            _this.printEpilogueEnd();
        });
    }

    _createClass(CucumberReporter, [{
        key: 'writeHTMLReport',
        value: function writeHTMLReport(html, options) {
            var date = new Date().toDateString() + ' ' + new Date().toTimeString();
            var wrapper = null;

            if (!options.outputDir) {
                return;
            }

            wrapper = '\n        <html>\n            <title>' + date + '</title>\n            <head>\n                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">\n                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">\n                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>\n                <style>\n                    .feature {\n                        margin-left: 20px;\n                        padding: 10px;\n                    }\n                    .scenario {\n                        margin-left: 20px;\n                        padding: 10px;\n                    }\n                    .test {\n                        margin-left: 20px;\n                    }\n                    body {\n                        background-color: #e4e4e4;\n                    }\n                </style>\n            </head>\n            <body>\n                ' + html + '\n            </body>\n        </html>';

            if (options.includeTimestamps) {
                _fs2['default'].writeFileSync(options.outputDir + '/report-' + date + '.html', wrapper);
            } else {
                _fs2['default'].writeFileSync(options.outputDir + '/report.html', wrapper);
            }
        }
    }, {
        key: 'printLine',
        value: function printLine(status, line, options) {
            var color = this.baseReporter.color;

            if (!status || !line) {
                return;
            }

            process.stdout.write(color(status, line + esc.nl));
        }
    }, {
        key: 'printEpilogueEnd',
        value: function printEpilogueEnd() {
            var _baseReporter = this.baseReporter;
            var color = _baseReporter.color;
            var stats = _baseReporter.stats;

            var results = stats.getCounts();
            var total = results.failures + results.passes + results.pending;

            process.stdout.write(color('suite', esc.nl + total + ' steps ('));
            process.stdout.write(color('bright pass', results.passes + ' passed'));
            process.stdout.write(color('bright fail', ', ' + results.failures + ' failed'));
            process.stdout.write(color('pending', ', ' + results.pending + ' pending)' + esc.nl + esc.nl));
        }
    }]);

    return CucumberReporter;
})(_events2['default'].EventEmitter);

exports['default'] = CucumberReporter;
module.exports = exports['default'];
