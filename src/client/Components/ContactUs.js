import React from 'react';


export default function ContactUs() {
    return (
        <div>

            <div className="row">
                <div className="col s12 m6">
                    <div className="card blue-grey darken-1">
                        <div className="card-content white-text">
                            <span className="card-title">LightningHosted</span>
                            <p>LightningHosted is eager to hear from the comunity.
                            If you have any questions, conerns or sugestions
                                dont hesitate to reach out to us. </p>
                        </div>
                        <div className="card-action">
                            <a href='https://twitter.com/LightningHosted' className="waves-effect waves-light social-icon btn twitter">
                                <i className="fa fa-twitter"></i></a>
                            <a href='https://github.com/JacksonDMiller/LightningHosted' className="waves-effect waves-light social-icon btn twitter">
                                <i className="fa fa-github"></i></a>
                        </div>
                    </div>
                </div>
                <div className="col s12 m6">
                    <div className="card blue-grey darken-1">
                        <div className="card-content white-text">
                            <span className="card-title">Jackson Miller</span>
                            <p>LightningHosted is developed by Jackson Miller to give bitcoiners a fun space to
                            experiment with the lightning network. </p>
                        </div>
                        <div className="card-action">
                            <a href='https://twitter.com/JacksonDMiller' className="waves-effect waves-light social-icon btn twitter">
                                <i className="fa fa-twitter"></i></a>
                            <a href='https://github.com/JacksonDMiller' className="waves-effect waves-light social-icon btn twitter">
                                <i className="fa fa-github"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}