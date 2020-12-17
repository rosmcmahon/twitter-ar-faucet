import { createMuiTheme } from '@material-ui/core/styles';
import 'fontsource-roboto-mono'

import { red } from '@material-ui/core/colors';


// Create a theme instance.
const theme = createMuiTheme({
  // palette: {
  //   primary: {
  //     main: '#556cd6',
  //   },
  //   secondary: {
  //     main: '#19857b',
  //   },
  //   error: {
  //     main: red.A400,
  //   },
  //   background: {
  //     default: '#fff',
  //   },
  // },
  typography: {
    fontFamily: "Roboto Mono"
  }
});

export default theme;