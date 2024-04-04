import styled, {createGlobalStyle} from 'styled-components';

export const BackgroundBody = createGlobalStyle`
body {
    background: linear-gradient( to right, white 0%, white 48%, #FAFBFC 37%, #FAFBFC 100%);
    
    @media only screen and (max-width: 1000px) {
        background: white;
    }    
};
`;

export const Styles = styled.div`
.mobileMap{
    display: none;
}
.isSuccess{
    font: 400 15px/24px "Space Grotesk";
    letter-spacing: 0.2px;
    margin-top: 20px;
    color: green;    
}
.base {
     display: flex;
     justify-content: space-between;
     width: 100%;
     select{
         box-sizing: border-box;
         height: 57px;
         border: 1px solid #EBECF0;
         border-radius: 4px;
         background-color: #FFFFFF;
         padding-left: 16.5px;
         padding-right: 15.5px;
    }
     select:disabled {
         opacity: .65;
         cursor: not-allowed!important;
    }
     select:hover {
         border: 1px solid #B3BAC5;
         box-shadow: 0 2px 8px 0 rgba(66,82,110,0.16);
    }
     .selectDistance .ant-select-selection {
         box-shadow: none;
    }
     .ant-select-selection__rendered {
         line-height: 57px;
    }
     .ant-select-selection:hover {
         border: 1px solid #DFE1E6;
         &:hover{
             border: 1px solid #B3BAC5;
             box-shadow: 0 2px 8px 0 rgba(66,82,110,0.16);
        }
    }
     .partner, .input-box, .selectDistance {
         color: #505F79;
         font: 15px/24px"Space Grotesk";
    }

    .address.input-box {
        height: auto;
    }

     .input-box{
     textarea{
        border: none;
        width: 100%;
        height: 55px;
        resize: none;
        outline: none;
        border-radius: 4px;
        color: #505F79;
        font: 15px/24px"Space Grotesk";
        padding: 14px 0 10px 0;
        overflow: hidden;
        &:focus{
            &::placeholder{
                color: transparent;
            }
        }
       
        &::placeholder{
            color: #C1C7D0;  
        }
     }
         padding-left: 16.5px;
         box-sizing: border-box;
         height: 57px;
         border: 1px solid #EBECF0;
         border-radius: 4px;
         background-color: #FFFFFF;
         margin-bottom: 8px;
         transition: .3s;
         box-shadow: 0 8px 16px 0 rgba(10, 31, 68, 0.04), 0 0 1px 0 rgba(10, 31, 68, 0.08);
         position:relative;
         input {
            height: 57px;
         }
         &:hover{
           border-color: #B3BAC5;
           box-shadow: 0 12px 32px 0 rgba(10, 31, 68, 0.08), 0 0 1px 0 rgba(10, 31, 68, 0.1);
           span{
                color: #505F79 !important;
             }
        }
        &:focus-within{
           border-color: #B3BAC5;
           box-shadow:none;
        }
        &.input-box-error{
          border-color: #FF8F73;
          box-shadow:none;
           margin-bottom: 22px;
        }
         .validation {
             height: auto;
             position: absolute;
             left: 0px;
             z-index:2;
             color: #FF5630;
             font: 400 10px/16px "Space Grotesk";
             margin: 2px auto 4px;
        }
    }
}
 .namesWidth {
     width: 49%;
}
 .selectDistance {
     width: 100%;
     .ant-select-selection {
         box-shadow: 0 2px 8px 0 rgba(66,82,110,0.16);
         box-sizing: border-box;
         height: 57px;
         border: 1px solid #EBECF0;
         border-radius: 4px;
         background-color: #FFFFFF;
         padding-left: 6.5px;
         padding-right: 15.5px;
    }
     .ant-select-selection-selected-value {
         padding-right: 0px;
    }
}
 .selectPartner {
     width: 100%;
}
 .names-block {
     display: flex;
     justify-content: space-between;
     .input-box:first-child {
        margin-right: 5px;
        @media only screen and (max-width: 1152px) {
            margin-right: 0;
        }
     }
}
 .email-block {
     margin-bottom:23.5px;
 }

.handwerker-form{
  input {
     outline: none;
     max-height: 55px;
  }
  input:-webkit-autofill {
     -webkit-box-shadow: inset 0 0 0 50px white !important;
     -webkit-text-fill-color: rgb(80, 95, 121);
  }
}
 .selects-block {
     margin-bottom:23.5px;
}
 .company-block {
     margin-bottom:23.5px;
}
 .marginBottom{
     margin-bottom: 8px;
}
 .title {
     color: #42526E;
     font: 600 32px/40px "Space Grotesk Semi Bold";
     margin-bottom: 16px;
}
 .subTitle {
     color: #505F79;
     font: 400 15px/24px "Space Grotesk";
     letter-spacing: 0.2px;
     margin-bottom: 33.5px 
}
 form {
     position: relative;
     width: 49%;
     max-width: 580px;
     padding: 12.5% 5% 10% 6%;
}
 .googleMap{
     width: 100%;
     margin-top: 89px;
}
 .partner{
     width: 100%;
     margin-bottom: 22px;
     .ant-select-selection {
         box-shadow: 0 2px 8px 0 rgba(66,82,110,0.16);
         box-sizing: border-box;
         height: 57px;
         border: 1px solid #EBECF0;
         border-radius: 4px;
         background-color: #FFFFFF;
         padding-left: 6.5px;
         padding-right: 15.5px;
         margin-top: -13px;
    }
     .ant-select-selection-selected-value {
         padding-right: 0px;
    }
}
 .categories-container {
     margin-left: -10px;
     @media (max-width: 767px) {
        margin-left: 0;
     }
}
 @media only screen and (max-width: 1152px) {
      .input-box{
          width: 100%;
      }
     .buttons-block{
         margin-top: 32px;
     }   
     .company-block{
         margin-top: 23.5px;
     }
     .selects-block{
        margin-bottom: 7.5px;
     }
     .mobileMap{
        display: initial;
     }
     .googleMap{
         display: none;
    }
     .title{
         text-align: center;
    }
     .subTitle{
         text-align: center;
    }
     .base {
         flex-wrap: wrap;
         justify-content: center;
    }
     form {
         width: 480px;
         padding: 120px 2% 1% 2%;
    }
     .names-block, .selects-block{
         flex-wrap: wrap;
    }
     .namesWidth, .selectPartner, .button {
         width: 100%;
    }
     .selectDistance{
         width: 100%;
         .ant-select-selection__rendered {
             margin-left: 10.5px;
        }
    }
}
 @media only screen and (max-width: 540px) {
     form {
         padding: 84px 20px 10px 20px;
    }
     .title {
         font-size: 15px;
         font-weight: 600;
         line-height: 24px;
         margin-bottom:16px;
    }
     .subTitle{
         font-size: 12px;
         line-height: 16px;
    }
}
`;
