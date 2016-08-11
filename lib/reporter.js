import events from 'events'
import fs from 'fs'
const esc = {
    sp: '\u0020',
    nl: '\n'
}

/**
 * Initialize a new `Specs` matrix test reporter.
 *
 * @param {Runner} runner
 * @api public
 */
class CucumberReporter extends events.EventEmitter {
    constructor (baseReporter, config, options = {}) {
        let isFeatureStarted = false
        let isScenarioStarted = false
        let reportHTML = ''

        super()

        this.baseReporter = baseReporter

        this.on('suite:start', (p) => {
            if (p.parent) {
                this.printLine('suite', `${esc.nl}${esc.sp}${esc.sp}${esc.sp}${esc.sp}Scenario: ${p.title}`)

                if (isScenarioStarted) {
                    reportHTML += `</div><div class='scenario'><h4>Scenario: ${p.title}</h4>`
                } else {
                    reportHTML += `<div class='scenario'><h4>Scenario: ${p.title}</h4>`
                    isScenarioStarted = true
                }
            } else {
                this.printLine('medium', `${esc.nl}${esc.sp}${esc.sp}Feature: ${p.title}`)

                if (isFeatureStarted) {
                    reportHTML += `</div></div><div class='feature'><h3>Feature: ${p.title}</h3>`
                    isScenarioStarted = false
                } else {
                    reportHTML += `<div class='feature'><h3>Feature: ${p.title}</h3>`
                    isScenarioStarted = false
                    isFeatureStarted = true
                }
            }
        })

        this.on('test:pending', (p) => {
            this.printLine('pending', `${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${p.title}`)
            reportHTML += `<div class='pending list-group-item-info test'>[Pending]: ${p.title}</div>`
        })

        this.on('test:pass', (p) => {
            this.printLine('bright pass', `${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${p.title}`)
            reportHTML += `<div class='pass list-group-item-success test'>[Pass]: ${p.title}</div>`
        })

        this.on('test:fail', (p) => {
            this.printLine('bright fail', `${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${p.title}`)
            this.printLine('error message', `${esc.nl}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${p.err.message}${esc.nl}`)
            this.printLine('error stack', `${esc.nl}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${esc.sp}${p.err.stack}${esc.nl}`)
            reportHTML += `<div class='fail list-group-item-danger test'>[Failed]: ${p.title}</div>`
        })

        this.on('test:end', () => {
        })

        this.on('end', () => {
            reportHTML += '</div></div>'
            this.writeHTMLReport(reportHTML, options)
            this.printEpilogueEnd()
        })
    }

    writeHTMLReport (html, options) {
        let date = `${new Date().toDateString()} ${new Date().toTimeString()}`
        let wrapper = null

        if (!options.outputDir) {
            return
        }

        wrapper = `
        <html>
            <title>${date}</title>
            <head>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
                <style>
                    .feature {
                        margin-left: 20px;
                        padding: 10px;
                    }
                    .scenario {
                        margin-left: 20px;
                        padding: 10px;
                    }
                    .test {
                        margin-left: 20px;
                    }
                    body {
                        background-color: #e4e4e4;
                    }
                </style>
            </head>
            <body>
                ${html}
            </body>
        </html>`

        if (options.includeTimestamps) {
            fs.writeFileSync(`${options.outputDir}/report-${date}.html`, wrapper)
        } else {
            fs.writeFileSync(`${options.outputDir}/report.html`, wrapper)
        }
    }

    printLine (status, line, options) {
        const { color } = this.baseReporter

        if (!status || !line) {
            return
        }

        process.stdout.write(color(status, line + esc.nl))
    }

    printEpilogueEnd () {
        const { color, stats } = this.baseReporter
        const results = stats.getCounts()
        const total = results.failures + results.passes + results.pending

        process.stdout.write(color('suite', esc.nl + total + ' steps ('))
        process.stdout.write(color('bright pass', results.passes + ' passed'))
        process.stdout.write(color('bright fail', ', ' + results.failures + ' failed'))
        process.stdout.write(color('pending', ', ' + results.pending + ' pending)' + esc.nl + esc.nl))
    }
}

export default CucumberReporter
