import React from 'react'
import { JobsListPane } from '../containers'

  export default class Html extends React.Component {
    render() {
      const stringData = 'var APP_PROPS = ' + JSON.stringify(this.props.containerData) + ';';

      return (
        <html>
          <head>
            <meta charSet="utf-8" />
            <link href="http://fonts.googleapis.com/css?family=Raleway:100" rel="stylesheet" type="text/css" />
            <link href="css/styles.css" rel="stylesheet" type="text/css" />
          </head>
          <body>
            <div id="content">
              <JobsListPane containerData={this.props.containerData} />
            </div>
            <script dangerouslySetInnerHTML={{__html: stringData}}></script>
            <script type="text/javascript" src="scripts/app.bundle.js"></script>
          </body>
        </html>
      )
    }
  }
