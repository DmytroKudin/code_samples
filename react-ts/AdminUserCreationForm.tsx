import { useFormik } from 'formik';
import styled from 'styled-components';
import CustomButton from '../../../components/Buttons/CustomButton';
import CustomInput from '../../../components/inputs/CustomInput';
import { createAdminUserFormSchema, updateAdminUserFormSchema } from '../../../validation/createAdminUserFormSchema';

type DeepKeysArrAndObj<T, Key extends keyof T = keyof T> = Key extends string
    ? T[Key] extends string | number
        ? Key
        :
        T[Key] extends Array<string>
            ? `${Key}.${number}`
            :
            T[Key] extends Array<object>
                ? `${Key}.${number}.${DeepKeysArrAndObj<T[Key][number]>}`
                : `${Key}.${DeepKeysArrAndObj<T[Key]>}`
    : never
export interface AdminUsersFromData {
 first_name: string
 last_name: string
 email: string
 password: string
 password_confirmation: string
 department: string
}

export type GenerateCreateAdminUserErrors = {
  [key in DeepKeysArrAndObj<AdminUsersFromData>]: string
}
type WorkerCreationFormProps = {
  errorsProps?: GenerateCreateAdminUserErrors
  onSubmit: (data: AdminUsersFromData) => void
  editMode: boolean
  editableValues?: AdminUsersFromData
}
function AdminUserCreationForm({
  errorsProps, onSubmit, editMode, editableValues,
}: WorkerCreationFormProps) {
  const initialValues: AdminUsersFromData = editableValues || {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: '',
  };

  const formik = useFormik<AdminUsersFromData>({
    initialValues,
    onSubmit,
    validationSchema: editMode ? updateAdminUserFormSchema : createAdminUserFormSchema,
  });

  const {
    setFieldValue, values: formikValues, errors, touched,
  } = formik;

  type TranslationKey = DeepKeysArrAndObj<AdminUsersFromData>;
  const handleFieldChange = (key: TranslationKey, value: string) => {
    setFieldValue(key, value);
  };

  return (
    <StyledForm onSubmit={(e) => {
      e.preventDefault();
      formik.submitForm();
    }}
    >
      <div className="section">
        <div className="section-content">
          <div className="input-container">
            <CustomInput
              label="First Name"
              required
              wrapperClass="input-wrapper"
              value={formikValues.first_name}
              onChange={(value) => handleFieldChange('first_name', value)}
              error={errors.first_name && touched?.first_name ? errors.first_name : errorsProps?.first_name}
              data-testid="first_name"
            />
          </div>
          <div className="input-container">
            <CustomInput
              label="Last Name"
              required
              wrapperClass="input-wrapper"
              value={formikValues.last_name}
              onChange={(value) => handleFieldChange('last_name', value)}
              error={errors.last_name && touched?.last_name ? errors.last_name : errorsProps?.last_name}
              data-testid="last_name"
            />
          </div>
          <div className="input-container">
            <CustomInput
              label="Email"
              required
              wrapperClass="input-wrapper"
              value={formikValues.email}
              onChange={(value) => handleFieldChange('email', value)}
              error={errors.email && touched?.email ? errors.email : errorsProps?.email}
              data-testid="email"
            />
          </div>
          <div className="input-container">
            <CustomInput
              label="Password"
              required
              type="password"
              wrapperClass="input-wrapper"
              value={formikValues.password}
              onChange={(value) => handleFieldChange('password', value)}
              error={errors.password && touched?.password ? errors.password : errorsProps?.password}
              data-testid="password"
            />
          </div>
          <div className="input-container">
            <CustomInput
              label="Password Confirmation"
              required
              type="password"
              wrapperClass="input-wrapper"
              value={formikValues.password_confirmation}
              onChange={(value) => handleFieldChange('password_confirmation', value)}
              error={errors.password_confirmation && touched?.password_confirmation ? errors.password_confirmation : errorsProps?.password_confirmation}
              data-testid="confirmation"
            />
          </div>
          <div className="input-container">
            <CustomInput
              label="Department"
              required
              wrapperClass="input-wrapper"
              value={formikValues.department}
              onChange={(value) => handleFieldChange('department', value)}
              error={errors.department && touched?.department ? errors.department : errorsProps?.department}
              data-testid="department"
            />
          </div>
        </div>
      </div>

      <div className="buttons-container">
        <div className="save-button">
          <CustomButton type="submit">
            {editMode ? 'Update User' : 'Create User'}
          </CustomButton>
        </div>
      </div>
    </StyledForm>
  );
}

export default AdminUserCreationForm;

const StyledForm = styled.form`
  padding-left: 61px;
  padding-right: 39px;
  .section {
    padding-top: 31px;
    .section-title-container {
      display: flex;
      justify-content: space-between;
    }
    .section-title {
      font-size: 20px;
      margin-bottom: 16px;
    }

    .section-content {
      background-color: #fff;
      border-radius: 8px;
      padding: 8px;
      padding-left: 0;
      padding-top: 1px;
      box-shadow: 0 5px 5px rgba(23, 23, 23, 0.31);
      
      .input-container {
        padding-top: 18px;
        padding-bottom: 18px;
        :not(:last-child) {
          border-bottom: 0.5px solid #c1c1c1;
        }
        label {
          max-width: 198px;
          color: ${(props) => props.theme.secondaryTextColor};
          font-size: 14px;
        }
        input {
          width: 100%;
          max-width: 315px;
        }
        .input-wrapper {
          padding-left: 36px;
          display: grid;
          grid-template-columns: clamp(150px, 40%, 198px) clamp(215px, 40%, 315px);
        }
        .select-container {
          padding-left: 36px;
          display: grid;
          grid-template-columns: clamp(150px, 40%, 198px) clamp(215px, 40%, 315px);
          label {
            color: ${(props) => props.theme.secondaryTextColor};
            font-size: 14px;
            font-weight: normal;
          }
          .select-wrap {
            max-width: 315px;
            height: 39px;
          }
        }
     
        &.phone-input {
          padding-left: 36px;
          input {
            height: 39px;
            max-width: 315px;
            margin-left: 0;
          }
          > div {
            display: grid;
            grid-template-columns: clamp(150px, 40%, 198px) clamp(215px, 40%, 315px);
          }
        }
        &.double-inputs {
          display: flex;
          padding-left: 0;
          .input-wrapper {
            display: flex;
            flex-direction: row;
          }
          label {
            display: none;
          }
          .with-label {
            label {
              display: block;
              width: 197px;
            }
          
          }
          .input-wrapper {
            &:not(.with-label) {
              padding-left: 0;
              margin-left: 13px;
            }  
          }
          .symbol-input-wrapper {
            max-width: 151px;
          }
          input {
            width: 151px;
          }
        }
        
        &.with-button {
          display: flex;
          align-items: center;
          .input-wrapper {
            display: grid;
            min-width: 513px;
            grid-template-columns: clamp(150px, 60%, 198px) clamp(215px, 60%, 315px);
            label {
              max-width: 198px;
            }
            input {
              width: 100%;
            }
          }
          .add-button {
            margin-left: 18px;
          }
        }
      }
    }
  }

  .buttons-container {
    margin-top: 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    .add-location-btn {
      color: ${(props) => props.theme.primaryColor};
      display: flex;
      align-items: center;
      span {
        margin-left: 7px;
        font-size: 14px;
      }
    }
    .save-button {
      .primary {
        border-radius: 4px;
      }
    }
  }
`;
