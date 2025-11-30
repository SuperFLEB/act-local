# Act Local

https://github.com/SuperFLEB/act-local

![Screenshot](./docs/screenshot.png)

Act Local is a small browser-based application that lists open ports serving HTTP and HTTPS on
your local machine and presents them in a clickable list. This allows you to easily see
and access all the local development servers or local Web applications running on your machine.
Updates happen in real-time as services are added and removed, and titles and icon information
are automatically determined from the content being served.

## Status

This is currently in early development. (It's a scratch-an-itch project so I can access
all my open Docker development servers and my Penpot local instance without needing to remember
port numbers, and it does that well enough for me.) It does what it does, but matters such as
security review, tests, and advanced features still need to be done.

## To use

(This should get easier once I get it into an NPM package, but for now, you have to build it.)

Requirements: Node.js 16+, Yarn, and a POSIX shell for running scripts

```shell
# Clone this repository
yarn install

# Build the application (the first time you use it)
yarn build

# Run the server
node dist/server.js

# Run the server and open the page in a browser window
node dist/server.js start
```

If you want to use different ports, specify them as environment variables `ACT_LOCAL_HTTP_PORT` and `ACT_LOCAL_WS_PORT`.
At build time, they will be used as default ports in the built application. At run time, they will override the defaults
(though the Vite application will still use the default port 5173).

If the ACT_LOCAL_HTTP_PORT is specified and the ACT_LOCAL_WS_PORT is not, the WS port will be one greater than
the HTTP port.

e.g.,

```shell
# To build with ports 80 (HTTP) and 81 (WebSockets)
ACT_LOCAL_HTTP_PORT=80 yarn build

# To build with ports 80 (HTTP) and 8880 (WebSockets)
ACT_LOCAL_HTTP_PORT=80 ACT_LOCAL_WS_PORT=8880 yarn build

# To run with different ports
ACT_LOCAL_HTTP_PORT=8800 ACT_LOCAL_WS_PORT=8801 node dist/server.js
```

Note that Node.js dependencies are not bundled into the `dist/` output, so this must be run from
within the project directory.

Once you have the server running, browse to http://localhost:8880 or whatever port the HTTP server
is running on. You should see all ports that are currently serving HTTP or HTTPS pages, and can
double-click on them to open them in a new tab.

## Development Mode

The application is developed using Vue and Vite. The `yarn dev` command will start a development
server that will automatically rebuild the application when changes are made.

In development mode, the frontend will run using the Vite development server. The API server will be active, but will
not serve front-facing pages. In production/built mode, the compiled frontend is served by the same server and
same port as the APIs, using `server.js`.

## Upcoming Features and Enhancements

This may or may not get significant future development, but if it does, here are my targets:

- Hide applications or change options like hostname or protocol, based on factors
  such as the port name, response headers, and page title.
- Persist applications with the ability to run a startup command if they are not active.
- Layout enhancements, sorting, grouping, etc.
- Tests, security review, etc.

