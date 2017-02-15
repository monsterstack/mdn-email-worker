'use strict';
const Promise = require('promise');
const config = require('config');
const SENDGRID_APIKEY = config.email.sendgrid.apiKey;
const sendgrid = require("sendgrid")(SENDGRID_APIKEY);

const debug = require('debug')('email-service');

class EmailService {
    constructor() {

    }

    email(record) {
        let p = new Promise((resolve, reject) => {
            // using SendGrid's Node.js Library
            // https://github.com/sendgrid/sendgrid-nodejs
            let emailRequest = record;
            let personalizations = [{
                to: [ {
                    email: emailRequest.to
                }],
                subject: emailRequest.subject
            }];
            let from = {
                email: emailRequest.from
            };
            let content = [{
                type: 'text/html',
                value: emailRequest.body
            }];

            let request = sendgrid.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: {
                    personalizations: personalizations,
                    from: from,
                    content: content
                }
            });
            debug(`Sending request to ${emailRequest.to}`);
            debug(emailRequest);
            sendgrid.API(request, (error, response) => {
                if(error) {
                    let errors = response.body.errors;
                    for(let i in errors) {
                        debug(errors[i]);
                    }
                    reject(error);
                } else {
                    debug(response);
                    resolve(record);
                }
            });
        });

        return p;
    }
}

module.exports = EmailService;