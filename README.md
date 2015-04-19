# seedReact

Betaserie + Kickass.to + Freebox OS + React.js

Note that : freebox-os-client, node-betaserie and nt found in npm are not the one I use here (April 2015).
I asked for pull requests since I updated some of these.

## Config files

You will need a config folder with three files :

### app.js

You have to first create the freebox app and get those infos

```json
module.exports = {
    app_version:'X.X.X',
    app_id: 'XXX',
    app_token: 'XXX',
    secret: 'XXX' // for express session
};
```

### betaserie.js

```json
module.exports = {
    api_key: 'XXX',
    users: [
        {
            name: 'XXX',
            login: 'XXX',
            password: 'XXX'
        },
        ...
    ]
};
```

### freebox.js

```json
module.exports = {
    url: 'X.X.X.X',
    port: YOUR_PORT
};
```