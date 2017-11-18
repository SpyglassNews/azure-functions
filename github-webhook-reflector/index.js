module.exports = function (context, data) {
    const http       = require('http');
    const https      = require('https');
    const url        = require('url');

    const event_type = context.req.headers['x-github-event'];
    const endpoint   = url.parse(process.env.JENKINS_URL + '/github-webhook/');

    context.log('Triggered from webhook', event_type);

    const options = {
        host: endpoint.host,
        path: endpoint.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-GitHub-Event': event_type,
        }
    };
    let proto = http;

    if (endpoint.protocol == 'https:') {
        proto = https;
    }

    let req = proto.request(options, function(res) {
        context.log('Reflecting webhook..');
        res.on('data', function(body) {
            context.log(body);
        });
        res.on('end', function() {
            context.log('Finished');
            context.done();
        });
    }).on('error', function(e) {
        context.log('Failed to reflect the webhook', e.message);
        context.done();
    });

    /* Write the request to the Jenkins instance */
    req.write(JSON.stringify(data));
    req.end();
};
