import styled from 'styled-components';

export default styled.div`
	.buttons-block {
     text-align: center;
     display: flex;
     justify-content: left;
     margin-top: 39px;
     width: 100%;
     
     @media (max-width: 767px){
         width: 100%;
        display: block;
        margin-left: 0 !important;
    }
     div {
         padding: 7px 0 9px;
         width: 120px;
         border-radius: 4px;
         cursor: pointer;
         font: 600 13px/24px "Space Grotesk Semi Bold";
         text-align: center;
         @media (max-width: 767px) {
         margin-bottom: 15px;
             width: 256px;
        }
    }
     .buttons-back {
        background-color: #F4F5F7;
         color: #505F79;
         margin-right: 15px;
         transition: all .3s;
         @media (max-width: 1280px){
            width: 100%;
         }
    }
     .buttons-back:hover{
         transform:translateY(-1px);
        background-color: #EBECF0;
    }
     .buttons-back:active{
        background-color: #C1C7D0;
    }
    .buttons-next {
        user-select:none;
        background-color: #0065FF;
        color: #FAFBFC;
        font:600 13px/24px "Space Grotesk Semi Bold";
        transition: all .3s ease-in;
    
        @media (max-width: 1280px){
            width: 100%;
        }
    }
     .buttons-next:hover{
         transform:translateY(-1px);
         background-color: #2684FF;
    }
     .buttons-next:active{
        background-color: #0052CC;
        box-shadow: 0 2px 8px 0 rgba(66,82,110,0.16);
    }
    .buttons-next.disabled{
        background-color: #F4F5F7;
        color: #C1C7D0;
        cursor: not-allowed;
        &:hover {
            transform: none;
            box-shadow: none;
        }
    }
}
`;
