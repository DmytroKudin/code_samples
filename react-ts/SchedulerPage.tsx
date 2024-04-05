import React, {
  useCallback, useEffect, useReducer, useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { Dropdown, Toggle } from 'rsuite';
import { WithAsProps } from 'rsuite/esm/@types/common';
import styled from 'styled-components';
import { queryClient } from '../../../App';
import { useAppMessageContext } from '../../../appMessagesContext';
import CustomButton from '../../../components/Buttons/CustomButton';
import CustomSelect, { SelectValue } from '../../../components/inputs/CustomSelect';
import { ApplicationTheme } from '../../../globalStyles';
import { formSelectOptions, roleHasAccess } from '../../../helpers';
import { useGetSelectedWorker } from '../../../hooks/getWorkersHook';
import { useGetExtensionWorker } from '../../../hooks/getExtensionHook';
import useNavigateHook from '../../../hooks/useNavigateHook';
import Pages from '../../../Router/pages';
import { FundsState } from '../../../store';
import { getMeRequest } from '../../../store/auth/actions';
import { SupperAdminRoles } from '../../../store/constants';
import { RequestKeys } from '../../../store/keys';
import { getBalanceRequest, ToggleAutopostingRequest } from '../../../store/settings/actions';
import PendingTab from './PendingTab';
import ProfilesTab from './ProfilesTab';
import PlanTab, { PlanrDetailsDataT } from './PlanTab';

export type PlanrSectionTabsT = 'post' | 'pland' | 'profiles'
function PlanrSection() {
  const [activeTab, setActiveTab] = useState<PlanrSectionTabsT>('post');
  const navigate = useNavigateHook();
  const { showMessage } = useAppMessageContext();
  const params = useParams<{tab: PlanrSectionTabsT, type: PlanrDetailsDataT['type']}>();
  const selectedWorker = useGetSelectedWorker();
  const [amountSelectValue, setAmountSelectValue] = useState<SelectValue>(null);

  const getMe = getMeRequest();
  const workersIDReqLoading = (roleHasAccess(getMe?.data?.data.role, SupperAdminRoles) ? !!selectedWorker?.id : true);
  const urlSearchParams = new URLSearchParams(window.location.search);
  const urgentQuery = Object.fromEntries(urlSearchParams.entries()).urgent ? Object.fromEntries(urlSearchParams.entries()).urgent : '0';
  const initialType: PlanrDetailsDataT['type'] = params.type || 'facebook';
  const { responseData: balance } = getBalanceRequest({ worker_id: selectedWorker?.id }, workersIDReqLoading);
  const toggleAutopostingRequest = ToggleAutopostingRequest();
  const [autoposting, setAutoposting] = useState<boolean>(!!selectedWorker?.fb_autoposting);

  const [selectedTab, setSelectedTab] = useState<PlanrDetailsDataT['type']>(initialType);
  const [tabDropdownOpen, setTabDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    setAutoposting(selectedWorker ? !!selectedWorker?.fb_autoposting : !!getMe?.data?.data?.fb_autoposting);
  }, [selectedWorker?.fb_autoposting, getMe?.data?.data?.fb_autoposting]);

  const [detailsData, setDetailsData] = useReducer(
    (state: PlanrDetailsDataT, newState: Partial<PlanrDetailsDataT>) => ({
      ...state,
      ...newState,
    }),
    {
      profile: null,
      date: null,
      time: null,
      timezone: null,
      urgent: urgentQuery === '1',
      type: initialType,
    },
  );
  const renderTab = useCallback(() => {
    switch (activeTab) {
      case 'pland':
        return <PendingTab planrType={detailsData.type} detailsData={detailsData} />;
      case 'profiles':
        return <ProfilesTab />;
      default:
        return <PlanTab onDetailsDataChange={setDetailsData} detailsData={detailsData} />;
    }
  }, [activeTab, detailsData]);

  const formCalendarLabel = (detailsDataType: PlanrDetailsDataT['type'], urgent: PlanrDetailsDataT['urgent']): string => {
    switch (detailsDataType) {
      case 'facebook':
        return 'Pland';
      default:
        return urgent ? 'Past Posts' : 'Pland Posts';
    }
  };

  type TabsT = {
    label: string
    key: PlanrSectionTabsT
  }
  const tabs: TabsT[] = [
    { label: 'Post', key: 'post' },
    { label: formCalendarLabel(detailsData?.type, detailsData?.urgent), key: 'pland' },
    { label: 'Profiles', key: 'profiles' },
  ];

  useEffect(() => {
    const isFormPage = window.location.pathname.includes(Pages.PlanrProfileFromSettingPure);
    if (isFormPage) {
      setActiveTab('profiles');
    }
  }, [window.location.pathname]);
  useEffect(() => {
    if (params?.tab) {
      setActiveTab(params?.tab);
    }
  }, [params?.tab]);

  const handleTabNavigate = (key: PlanrSectionTabsT) => {
    navigate(`${Pages.PlanrSettingPure + (initialType)}/${key}${urgentQuery === '1' ? '?urgent=1' : ''}`);
  };
  const tabsToHide: PlanrSectionTabsT[] = detailsData.type === 'facebook' ? ['profiles'] : [];

  const calculatedBalance = Number(balance?.balance) ? Number(balance?.balance) / 100 : '';

  const handleAddFunds = (selectedAmount?: number | string) => {
    queryClient.setQueryData<FundsState>([RequestKeys.ADD_FUNDS_STATE], {
      funds: selectedAmount ? String(selectedAmount) : '5',
    });
    navigate(Pages.billingAddFunds);
  };

  const isConnected = useGetExtensionWorker();

  const renderDropdownButton = (props: WithAsProps, ref: React.Ref<HTMLImageElement>) => (
    <div
      {...props}
      ref={ref}
    >
      <CustomButton
        onClick={() => setSelectedTab('data')}
        className={`posting-button ${selectedTab === 'data' && 'active'}`}
        wrapperClassname="posting-button-wrap"
        variant="outlined-box"
      >
        data
      </CustomButton>
    </div>
  );

  useEffect(() => {
    if (!tabDropdownOpen && detailsData.type === 'facebook') {
      setSelectedTab('facebook');
    }
  }, [tabDropdownOpen]);

  const handleAutopostingToggle = (val: boolean) => {
    setAutoposting(val);
    const ID = selectedWorker?.id ? selectedWorker?.id : getMe?.data?.data?.worker_id;
    if (ID) {
      toggleAutopostingRequest.mutate({ fb_autoposting: val, worker_id: ID });
    }
  };

  return (
    <Container>
      <div className="posting-type">
        <CustomButton
          onClick={() => {
            setSelectedTab('facebook');
            setDetailsData({ type: 'facebook' });
            const nextTab: PlanrSectionTabsT = activeTab === 'pland' ? 'pland' : 'post';
            navigate(`${Pages.PlanrSettingPure}facebook/${nextTab}`);
          }}
          className={`posting-button ${selectedTab === 'facebook' && 'active'}`}
          wrapperClassname="posting-button-wrap"
          variant="outlined-box"
        >
          Facebook
        </CustomButton>
        {activeTab !== 'profiles'
          ? (
            <Dropdown
              renderToggle={renderDropdownButton}
              placement="bottomEnd"
              open={tabDropdownOpen}
              onClose={() => {
                setTabDropdownOpen(false);
              }}
              onToggle={(value) => {
                if (value) {
                  setTabDropdownOpen(value);
                }
              }}
            >
              <>
                {isConnected
              && (
              <Dropdown.Item
                onClick={() => {
                  navigate(`${Pages.PlanrSettingPure}data/${activeTab}?urgent=1`);
                  setDetailsData({ type: 'data', urgent: true });
                  setTabDropdownOpen(false);
                }}
                style={{
                  color: (detailsData.urgent && detailsData.type === 'data') ? ApplicationTheme.primaryColor : '#575757',
                  width: '157px',
                }}
              >
                Post Now
              </Dropdown.Item>
              )}
                <Dropdown.Item
                  onClick={() => {
                    navigate(`${Pages.PlanrSettingPure}data/${activeTab}`);
                    setDetailsData({ type: 'data', urgent: false });
                    setTabDropdownOpen(false);
                  }}
                  style={{
                    color: (!detailsData.urgent && detailsData.type === 'data') ? ApplicationTheme.primaryColor : '#575757',
                    width: '157px',
                  }}
                >
                  Plan Post
                </Dropdown.Item>
              </>
            </Dropdown>
          )
          : (
            <CustomButton
              onClick={() => {
                setSelectedTab('data');
                setDetailsData({ type: 'data' });
              }}
              className={`posting-button ${selectedTab === 'data' && 'active'}`}
              wrapperClassname="posting-button-wrap"
              variant="outlined-box"
            >
              data
            </CustomButton>
          )}
      </div>
      <div className="action-header">
        <div className="tabs">
          {tabs.map((tab) => (
            <div
              className={`tab-item ${tab.key === activeTab && 'active'} ${tabsToHide.includes(tab.key) && 'hidden'}`}
              key={tab.key}
              onClick={() => {
                handleTabNavigate(tab.key);
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        {detailsData.type === 'facebook'
        && (
        <div className="amount-container">
          <div className="amount-box" id="available-box">
            <div className="autoposting">
              <span className="toggle-label">Auto-posting to FB</span>
              <Toggle
                id="autoposting"
                arial-label="Switch"
                checked={autoposting}
                onChange={(val) => {
                  handleAutopostingToggle(val);
                }}
              />
            </div>
          </div>
        </div>
        )}
        {detailsData.type === 'data' && activeTab !== 'profiles' && !detailsData.urgent
        && (
        <div className="amount-container">
          <div className="amount-box" id="available-box">
            <div className="box-title">
              Available
            </div>
            <div className="box-value">
              $
              {calculatedBalance || 0}
            </div>
          </div>
          <div className="amount-box" id="amount-box">
            <div className="select-wrapper">
              <CustomSelect
                label="Amount"
                value={amountSelectValue}
                onChange={(val) => setAmountSelectValue(val)}
                options={formSelectOptions([5, 10, 15, 30, 50, 100])}
                className="select"
                placeholder={' '}
                controlStyles={{
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
                indicatorContainerStyles={{
                  borderLeft: '1px solid #bfbcbc',
                  height: 'inherit',
                  marginTop: '0',
                  backgroundColor: ApplicationTheme.primaryBGColor,
                }}
              />
            </div>
            <div className="button-wrapper budget-btn">
              <CustomButton
                variant="primary"
                onClick={() => {
                  if (amountSelectValue?.value) {
                    handleAddFunds(amountSelectValue?.value);
                  } else {
                    showMessage({ type: 'info', message: 'Please select amount' });
                  }
                }}
              >
                $ Add Budget
              </CustomButton>
            </div>
          </div>
        </div>
        )}
      </div>
      <div className="section-wrapper">
        {renderTab()}
      </div>
    </Container>
  );
}

export default PlanrSection;

const Container = styled.div`
  padding-top: 43px;
  font-size: 14px;
  color: ${(props) => props.theme.primaryTextColor};
  background-color: ${(props) => props.theme.primaryBGColor};

  .disabled-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 3;
    cursor: not-allowed;
    background-color: #c5c6c761;
  }

  .section-wrapper {
    position: relative;

    .disabled-overlay {
      top: -10px;
    }
  }

  .posting-type {
    display: flex;
    align-items: flex-start;

    .posting-button-wrap {
      width: 157px;

      .posting-button {
        border: none;
        font-size: 22px;
        color: #9e9d9d;
        background-color: #f3f3f3;

        &.active {
          color: ${(props) => props.theme.primaryColor};
          background-color: #ffffff;
        }
      }
    }
  }

  .pland-section {
    @media screen and (max-width: 1024px) {
      margin-top: 60px;
    }
  }

  .posting-section {
    @media screen and (max-width: 1024px) {
      margin-top: 80px;
    }
    @media screen and (max-width: 925px) {
      margin-top: -20px;
    }
  }

  .amount-container {
    position: relative;
    display: flex;
    gap: 10px;
    min-height: 60px;
    margin-top: -30px;
    @media screen and (max-width: 1024px) {
      margin-top: 20px;
    }
    @media screen and (max-width: 768px) {
      flex-direction: column;
    }

    .amount-box {
      background-color: #fff;
      display: flex;
      align-items: center;
      padding: 10px;

      .autoposting {
        .toggle-label {
          margin-right: 10px;
        }
      }

      @media screen and (max-width: 768px) {
        max-width: 280px;
      }

      &#available-box {
        min-width: 180px;
        color: #232323;
        display: flex;
        justify-content: space-around;
        font-size: 14px;

        .box-value {
          color: ${(props) => props.theme.secondaryColor};
          font-size: 18px;
        }
      }

      &#amount-box {
        max-width: unset;
        display: flex;
        align-items: flex-end;
        @media screen and (max-width: 768px) {
          max-width: 280px;
        }

        .select-wrapper {
          .select-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .select-wrap {
            height: 27px;
            width: 112px;
          }
        }

        .button-wrapper {
          margin-left: 10px;

          button {
            height: 27px;
            font-size: 14px;
            padding: 2px 10px;
            text-transform: none;
          }
        }
      }
    }
  }

  .action-header {
    display: flex;
    justify-content: space-between;
    padding-right: 1.2%;
    @media screen and (max-width: 1024px) {
      flex-direction: column;
    }
    border-bottom: 4px solid #fff;
    max-height: 50px;
    @media screen and (max-width: 768px) {
      max-height: unset;
      padding-bottom: 20px;
    }
    @media screen and (max-width: 925px) {
      flex-direction: column;
    }
  }

  .tabs {
    margin-top: 2px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    background-color: #f3f3f3;

    .tab-item {
      height: 39px;
      padding-left: 10px;
      padding-right: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      background-color: #f3f3f3;

      :not(:first-child) {
        margin-left: 5px;
      }

      color: #9e9d9d;

      &.active {
        color: ${(props) => props.theme.primaryColor};
        background-color: #ffffff;
      }

      &.hidden {
        display: none;
      }
    }
  }

  .content {
    padding-left: 23px;
    padding-right: 40px;
    text-align: start;
  }
`;
