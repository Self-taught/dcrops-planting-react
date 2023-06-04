import React from 'react';
import './Signin.css'


class SignIn extends React.Component {
    constructor() {
        super();
        this.state = {
            userName: '',
            isLoading: false
        }
    }

    onUserNameChange = (event) => {
        this.setState({ userName: event.target.value })
    }

    loadData = () => {
        if (this.state.userName.length > 1 && this.state.userName.length < 18) {

            this.setState({ isLoading: true }, () => {
                this.props.loadData(this.state.userName)
            });
        };
    }

    render() {
        return (
            <article className="br3 ba white mv4 w-100 w-50-m w-25-l shadow-5 mw6 center">
                <main className="pa4 black-80">
                    <div className="measure">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                            <legend className="f1 fw6 ph0 mh0">Load Data</legend>
                            <div className="mt3">
                                <p className="db fw6 lh-copy f6" htmlFor="userName">UserName</p>
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
                                {this.state.isLoading
                                    ? <div>
                                        <p className='f3'>'Loading your farms...Please wait...'</p>
                                    </div>

                                    : <input
                                        onClick={
                                            this.loadData
                                        }
                                        disabled={this.state.isLoading}
                                        className="pa2 input-reset ba bg-black hover-bg-black white w-100"
                                        type="submit"
                                        name="userName"
                                        value={this.state.isLoading ? 'Loading...' : 'Load Data'}
                                    />}
                            </div>
                        </fieldset>
                    </div>
                </main>
            </article>
        )
    }
};

export default SignIn;