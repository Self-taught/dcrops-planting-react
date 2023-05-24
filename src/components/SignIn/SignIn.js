import React from 'react';
import './Signin.css'


class SignIn extends React.Component {
    constructor() {
        super();
        this.state = {
            userName: '',
        }
    }

    onUserNameChange = (event) => {
        this.setState({ userName: event.target.value })
    }

    signIn = () => {

        if (window.hive_keychain) {
            const keychain = window.hive_keychain;

            keychain.requestCustomJson(this.state.userName, 'dcrops', 'Active', JSON.stringify('Abc'), 'it works', (response) => {
                console.log(response)
            });
        } else {
            console.log('You do not have hivekeychain!')
        }
    }

    render() {
        return (
            <article className="br3 ba white mv4 w-100 w-50-m w-25-l shadow-5 mw6 center">
                <main className="pa4 black-80">
                    <div className="measure">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                            <legend className="f1 fw6 ph0 mh0">Log In</legend>
                            <div className="mt3">
                                <label className="db fw6 lh-copy f6" htmlFor="userName">UserName</label>
                                <input
                                    onChange={this.onUserNameChange}
                                    className="pa2 input-reset ba bg-transparent Black w-100"
                                    type="text"
                                    name="userName"
                                    id="userName"
                                    autoComplete='off'
                                />
                            </div>
                            <div className="mt3 log-in-button">
                                <input
                                    onClick={() => this.props.loadData(this.state.userName)}
                                    className="pa2 input-reset ba bg-black hover-bg-black white w-100"
                                    type="submit"
                                    name="userName"
                                    value="Log In"
                                />
                            </div>
                        </fieldset>
                    </div>
                </main>
            </article>
        )
    }
};

export default SignIn;