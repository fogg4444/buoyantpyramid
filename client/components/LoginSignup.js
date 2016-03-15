// import React, { PropTypes } from 'react';
// import { browserHistory, Router, Route, Link } from 'react-router';

// class Login extends React.Component {
//   render() {
//     return (
//       <div>
//         <h3>Sign in or create an account</h3>
//         <input ref={ node => { this.input = node; } } />
//         <button onClick={ () => {
//           store.dispatch({
//             type: 'UPDATE_USER',
//             email: this.input.value,
//           });
//         } }>
//         Login
//         </button>
//       </div>
//     );
//   }
// }

// export default Login;


import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateUser } from '../actions';

let LoginSignup = ({ dispatch }) => {
  let input;

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault();
        if (!input.value.trim()) {
          return;
        }
        dispatch(updateUser(input.value));
        input.value = '';
      }}>
        <input ref={node => {
          input = node;
        }} />
        <button type="submit">
          Add Todo
        </button>
      </form>
    </div>
  );
};
LoginSignup = connect()(LoginSignup);


export default LoginSignup;