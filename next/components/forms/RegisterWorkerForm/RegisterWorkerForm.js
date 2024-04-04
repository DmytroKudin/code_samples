import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Alert from 'react-s-alert';
import { Form, Field } from 'react-final-form';
import { i18n } from 'i18n';
import { Select } from 'antd';
import {
    validationEmail,
    validationName,
    validationPhone,
    required
} from 'utils/validationController';
import { register } from 'store/auth/actions';
import { fetchJobCategories } from 'store/jobs/actions';
import { Styles, BackgroundBody } from './styles';
import PropTypes from 'prop-types';
import GoogleMap from 'components/general/GoogleMap';
import { radiuses, defaultRadius, defaultCenter } from './constants';
import NavigationButtons from './buttons/NavigationButtons';
import CategorySelectBox from 'inputs/CategorySelectBox';
import Input from 'components/inputs/Input';
import Loader from 'components/general/Loader';
import { STATE_STATUSES } from 'utils/stateStatuses';
import { getZipCode, getCountryByPhone } from 'utils/helpers';
import GoogleAutocomplete from 'inputs/GoogleAutocomplete';
import RegisterSuccess from 'components/general/RegisterSuccess/RegisterSuccess';
import { roles } from 'utils/constants';
const Option = Select.Option;
import { Router } from 'routes';
import AcceptCheckbox from '../../inputs/AcceptCheckbox';

export class RegisterWorkerForm extends Component {
    static propTypes = {
        fetchJobCategories:PropTypes.func,
        fetchStatus: PropTypes.string,
        zipcode: PropTypes.any,
        register: PropTypes.func,
        categories: PropTypes.array,
        status: PropTypes.string,
        router: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            address: '',
            initAddress:'',
            radius: defaultRadius,
            center: defaultCenter,
            place: null,
            isTerms: false,
            isPolicy: false,
            currentStep: 1,
            workerSkills: [],
            isSuccess: false,
            zipCode: props.router.query.zipcode || 10117,
            email: '',
        };
    }

    getGoogleAddress = async (paramString, setAddress = true) => {
        const res = await getZipCode(paramString);
        const formattedAddress = res.response.results[0].formatted_address;
        const newAddress = (formattedAddress === this.state.initAddress) ? '' : formattedAddress;

        this.setState({
            zipCode: res.zipCode,
            center: res.response.results[0].geometry.location,
            address: setAddress ? newAddress: '',
            initAddress: this.state.initAddress
        });
    };

    handleValidation = values => {
        const { email, firstName, phoneNumber, lastName, companyName } = values;
        const { address } = this.state;
        const errors = {};

        errors.firstName = validationName(firstName);
        errors.lastName = validationName(lastName);
        errors.email = validationEmail(email);
        errors.phoneNumber = validationPhone(phoneNumber);
        errors.companyName = required(companyName);
        errors.address = required(address);
        return errors;
    };

    onSubmit = async values => {
        const { register } = this.props;
        const { firstName, email, phoneNumber, lastName, companyName, partnerName } = values;
        const { radius, address, workerSkills, zipCode } = this.state;

        this.setState({email});

        const data = {
            firstName,
            lastName,
            email,
            phoneNumber,
            country: getCountryByPhone(phoneNumber),
            address1: address,
            serviceRadius: radius,
            workerSkills,
            partnerName,
            company: {name: companyName},
            zipCode,
            role: [roles.worker]
        };

        try {
            await register(data);
            const { router } = this.props;
            this.setState({isSuccess: true});
            Router.pushRoute(router.asPath+'?step=thankyou');
        }
        catch(error) {
            Alert.error(i18n.t('forms:RegisterWorkerForm.emailHasBeenTaken'));
        }
    };

    handleOnPlace = async place => {
        if(!place || !place.id){
            this.setState({address: this.state.initAddress});
            return;
        }
        const paramString = `latlng=${place.geometry.location.lat()},${place.geometry.location.lng()}`;
        const res = await getZipCode(paramString);

        this.setState({
            zipCode: res.zipCode,
            place,
            address: place.formatted_address,
            center: {
                lat: place.geometry && place.geometry.location.lat(),
                lng: place.geometry && place.geometry.location.lng()
            }
        });
    };

    onPrev = () => {
        this.setState(prevState => ({
            currentStep: prevState.currentStep > 1 ? prevState.currentStep - 1 : 1
        }));
    };

    onNext = () => {
        this.setState(prevState => ({ currentStep: prevState.currentStep + 1 }));
    };

    handleSubmit = (values) => {
        this.state.currentStep === 2 ? this.onSubmit(values) : this.onNext();
    };

    onCategorySelectBlockClick = (value) => {
        let skills = this.state.workerSkills;
        if (!skills.includes(value)) {
            skills.push(value);
        } else {
            skills.splice(skills.indexOf(value), 1);
        }
        this.setState({ workerSkills: skills });
    };

    render() {
        const { categories, status} = this.props;
        const {center, radius, isTerms, isPolicy, currentStep, workerSkills, isSuccess, email} = this.state;
        const isSubmitDisabled = isTerms && isPolicy ? false : true;
        let submitForm;
        const buttonProps = {
            prevProps: {
                action: this.onPrev,
                disabled: currentStep === 1,
                show: currentStep !== 1,
            },
            nextProps: {
                action: e => submitForm(e),
                disabled: isSubmitDisabled,
                label: currentStep === 2 ? i18n.t('forms:RegisterWorkerForm.buttons.register')  : i18n.t('forms:RegisterWorkerForm.buttons.next'),
            }
        };

        return (
            <Styles>
                <Loader height={'100vh'} show={status === STATE_STATUSES.PENDING} withChild={true}>
                    {
                        (currentStep === 2 && isSuccess) ?
                            <Fragment>
                                <BackgroundBody/>
                                <RegisterSuccess
                                    email={email}
                                />
                            </Fragment>
                            :
                            <div className="base">
                                <Form
                                    onSubmit={values => this.handleSubmit(values)}
                                    validate={values => this.handleValidation(values)}
                                    render={({ handleSubmit }) => {
                                        submitForm = handleSubmit;
                                        return (
                                            <form onSubmit={handleSubmit} className="form handwerker-form">
                                                <h1 className="title">{i18n.t(`forms:RegisterWorkerForm.step${currentStep}.title`)}</h1>
                                                <p className="subTitle">{i18n.t(`forms:RegisterWorkerForm.step${currentStep}.subTitle`)}</p>
                                                {currentStep === 1 ?
                                                    <Fragment>
                                                        <div className="names-block">
                                                            <Field
                                                                name={'firstName'}
                                                                placeholder={i18n.t('forms:RegisterWorkerForm.firstNameTitle')}
                                                                type={'text'}
                                                                component={Input}
                                                            />
                                                            <Field
                                                                name={'lastName'}
                                                                placeholder={i18n.t('forms:RegisterWorkerForm.lastNameTitle')}
                                                                type={'text'}
                                                                component={Input}
                                                            />
                                                        </div>
                                                        <div className="email-block">
                                                            <Field
                                                                name={'email'}
                                                                placeholder={i18n.t('forms:RegisterWorkerForm.emailTitle')}
                                                                component={Input}
                                                            />
                                                            <Field
                                                                name={'phoneNumber'}
                                                                placeholder={i18n.t('forms:RegisterWorkerForm.phoneNumberTitle')}
                                                                type={'text'}
                                                                component={Input}
                                                            />
                                                        </div>
                                                        <div className="selects-block">
                                                            <Field
                                                                name={'address'}
                                                                placeholder={i18n.t('forms:RegisterWorkerForm.address')}
                                                                onPlaceSelected={place => this.handleOnPlace(place)}
                                                                types={['geocode']}
                                                                handleOnPlace = {this.handleOnPlace}
                                                                place={this.state.place}
                                                                address={this.state.address}
                                                                onChange={e => {
                                                                    this.setState({address: e.target.value});}
                                                                }
                                                                onKeyPress={e => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        this.handleOnPlace(this.state.place);
                                                                    }
                                                                }}
                                                                component={GoogleAutocomplete}
                                                            />
                                                            <Select
                                                                className="selectDistance"
                                                                onChange={value => this.setState({ radius: value })}
                                                                value={radius}
                                                            >
                                                                {
                                                                    radiuses.map((item, i) =>
                                                                        <Option key={i} value={item.radius}>{`${item.radius}km`}</Option>)
                                                                }
                                                            </Select>
                                                        </div>
                                                        <div className="mobileMap">
                                                            <GoogleMap
                                                                radius={radius}
                                                                center={center}
                                                                getGoogleAddress={this.getGoogleAddress}
                                                            />
                                                        </div>
                                                        <div className="company-block">
                                                            <Field
                                                                name={'companyName'}
                                                                placeholder={i18n.t('forms:RegisterWorkerForm.companyName')}
                                                                type={'text'}
                                                                component={Input}
                                                            />
                                                            <Field
                                                                name={'partnerName'}
                                                                placeholder={i18n.t('forms:RegisterWorkerForm.partnerName')}
                                                                type={'text'}
                                                                component={Input}
                                                            />
                                                        </div>
                                                        <div className={'confirm'}>
                                                            <Field
                                                                name={'accept'}
                                                                type={'checkbox'}
                                                                component={AcceptCheckbox}
                                                                text={i18n.t('forms:ReceiveYourCategoryForm.accept')}
                                                                onChange={() => this.setState(prevState => ({ isTerms: !prevState.isTerms }))}
                                                                checked={isTerms}
                                                            />
                                                            <Field
                                                                name={'policy'}
                                                                type={'checkbox'}
                                                                component={AcceptCheckbox}
                                                                text={i18n.t('forms:ReceiveYourCategoryForm.policy')}
                                                                onChange={() => this.setState(prevState => ({ isPolicy: !prevState.isPolicy }))}
                                                                checked={isPolicy}
                                                            />
                                                        </div>
                                                    </Fragment> :
                                                    <CategorySelectBox categories={categories} workerSkills={workerSkills} onChange={this.onCategorySelectBlockClick} />
                                                }
                                                <NavigationButtons {...buttonProps} />
                                            </form>
                                        );
                                    }}
                                />
                                <div className="googleMap">
                                    <GoogleMap radius={radius} center={center} getGoogleAddress={this.getGoogleAddress} />
                                </div>
                            </div>
                    }
                </Loader>
            </Styles>
        );
    }
}

const mapStateToProps = state => ({
    status: state.auth.status,
    categories: state.jobs.jobCategories,
    fetchStatus: state.jobs.fetch_status,
});

const mapDispatchToProps = {
    register,
    fetchJobCategories,
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterWorkerForm);
