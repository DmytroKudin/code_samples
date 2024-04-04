import { useEffect, useMemo, useState } from 'react';
import Tooltip from 'rsuite/Tooltip';
import Whisper from 'rsuite/Whisper';
import styled from 'styled-components';
import CloudReflashIcon from '@rsuite/icons/CloudReflash';
import PeoplesIcon from '@rsuite/icons/Peoples';
import { queryClient } from '../../App';
import { useAppMessageContext } from '../../appMessagesContext';
import CustomButton from '../../components/Buttons/CustomButton';
import CustomTable from '../../components/CustomTable';
import DeleteModal from '../../components/DeleteModal';
import CustomCheckbox from '../../components/inputs/CustomCheckbox';
import SearchInput from '../../components/inputs/SearchInput';
import BinSvg from '../../components/SvgElements/BinSvg';
import PersonsSvg from '../../components/SvgElements/PersonsSvg';
import { setLocalStorage } from '../../helpers';
import { SelectedWorker } from '../../hooks/getWorkersHook';
import useNavigateHook from '../../hooks/useNavigateHook';
import Pages from '../../Router/pages';
import {
  WorkerType, DeleteWorkerRequest, FeedUpdateRequest, GetWorkers, GetWorkersParams,
} from '../../store/workers/actions';
import squareEdit from '../../assets/square-with-pencil.png';
import { LocalStorageKeys, RequestKeys } from '../../store/keys';

export type WorkersTableFiltersT = {
  params: GetWorkersParams
}
export interface WorkersTableData extends WorkerType {
  actions: string
}

type WorkersTableColumns = {
  label: string
  key: keyof Pick<WorkerType, 'workership_name' | 'primary_email' | 'created_at'> | 'action' | 'item_id'
  width?: number
}

function Workers() {
  const navigate = useNavigateHook();
  const { showMessage } = useAppMessageContext();
  const tableCashedParams = queryClient.getQueryData<WorkersTableFiltersT>([RequestKeys.DEALERS_TABLE]);
  const [showModal, setShowModal] = useState<{id: number} | boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const deleteWorkerReq = DeleteWorkerRequest();
  const itemsOnPage = tableCashedParams?.params?.limit || 10;
  const [search, setSearch] = useState<string>(tableCashedParams?.params?.search || '');
  const [page, setPage] = useState<number>(tableCashedParams?.params?.page || 1);
  const [params, setParams] = useState<GetWorkersParams>({
    page,
    limit: itemsOnPage,
  });

  const {
    data: workersData, refetch: refetchWorkers, meta: workersMeta, isFetching,
  } = GetWorkers(params);
  const workersIds = useMemo(() => workersData.map((worker) => worker.id), [workersData]);
  const feedUpdate = FeedUpdateRequest();
  const totalPages = workersMeta?.last_page;

  useEffect(() => {
    setParams((prevState) => ({
      ...prevState,
      page,
      limit: itemsOnPage,
      ...(search ? { search } : { search: undefined }),
    }));
  }, [page, itemsOnPage, search]);

  useEffect(() => {
    if (feedUpdate.isSuccess) {
      showMessage({ type: 'success', message: 'Updated successfully' });
      feedUpdate.reset();
    }
    if (feedUpdate.isError) {
      showMessage({ type: 'error', message: feedUpdate.error?.response?.data?.message || '' });
    }
  }, [feedUpdate.isSuccess, feedUpdate.isError]);

  const handlePrev = () => {
    setPage((prevState) => prevState - 1);
  };
  const handleNext = () => {
    setPage((prevState) => prevState + 1);
  };

  const handleCreateWorker = () => {
    navigate(Pages.workerCreation);
  };

  const modalText = () => (
    <div>
      <h3>
        Permanently Delete
      </h3>
      <div className="text">
        Are you sure you would like
        <br />
        to Permanently Delete these
        <br />
        Worker(s)?
      </div>
    </div>
  );
  useEffect(() => {
    if (deleteWorkerReq.isSuccess) {
      refetchWorkers();
      deleteWorkerReq.reset();
      showMessage({ type: 'success', message: 'Worker(s) Deleted successfully' });
    }
  }, [deleteWorkerReq.isSuccess]);

  const handleModalAccept = () => {
    if (typeof showModal === 'object') {
      deleteWorkerReq.mutate({ ids: [showModal?.id] });
    }
    deleteWorkerReq.mutate({ ids: selectedItems });
    setShowModal(false);
  };
  const handleCheckAll = () => {
    if (selectedItems.length === workersIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(workersIds);
    }
  };

  const handleWorkerClick = (worker: WorkersTableData) => {
    setLocalStorage(LocalStorageKeys.DEALER_ID, String(worker.id));
    queryClient.setQueryData<SelectedWorker>([RequestKeys.SELECTED_DEALER_ID], worker);
    navigate(`${Pages.inventoryManager}`);
  };

  const handleFeedUpdate = (workerId: number) => {
    feedUpdate.mutate({ id: workerId });
  };

  useEffect(() => {
    queryClient.setQueryData(
      [RequestKeys.DEALERS_TABLE],
      (oldVal: WorkersTableFiltersT) => ({
        ...oldVal,
        params: {
          ...oldVal?.params,
          page,
          search,
          limit: itemsOnPage,
        },
      }),
    );
  }, [page, search, itemsOnPage]);

  return (
    <Container>
      <div className="head">
        <div className="title">
          Workers
        </div>
        <div className="control">
          <div className="search">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </div>
          <div className="buttons-container">
            <div className="remove-btn-container">
              {selectedItems.length
                ? (
                  <IconWrapper className="remove-ico" onClick={() => setShowModal(true)}>
                    <BinSvg />
                  </IconWrapper>
                ) : null}
            </div>
            <div className="create-button">
              <CustomButton type="submit" onClick={handleCreateWorker}>Create Worker</CustomButton>
            </div>
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <div className="table-header">
          <div className="header-checkbox">
            <CustomCheckbox
              onChange={() => handleCheckAll()}
              checked={(selectedItems.length === workersData.length) && !!workersData.length}
              indeterminate={!!(selectedItems.length && selectedItems.length !== workersData.length)}
            />
            <div className="arrow" />
          </div>
        </div>
        <CustomTable
          loading={isFetching}
          data={workersData.map((dataRow: WorkersTableData) => ({
            ...dataRow,
            item_id: <IdCell item={dataRow} />,
            created_at: <CreatedAt item={dataRow} />,
            action: <ActionsCell
              onDotsClick={() => handleWorkerClick(dataRow)}
              onEditClick={() => navigate(`${Pages.workerCreation}/${dataRow.id}`)}
              onRemoveClick={() => setShowModal({ id: dataRow.id })}
              onFeedUpdate={() => handleFeedUpdate(dataRow.id)}
              onProvidersClick={() => navigate(`${Pages.providersPagePure}/${dataRow.id}`)}
            />,
          }))}
          columns={columns}
          onItemSelect={(selected) => setSelectedItems(selected)}
          selectable
          hideSelectHeader
          displayTotal={false}
          fillHeight={false}
          autoHeight
          fullHeightContainer={false}
          displayPagination={false}
          checkedKeysProp={selectedItems}
        />
        <div className="table-footer">
          <button type="button" onClick={handlePrev} disabled={page === 1}>Previous</button>
          <div>
            {workersMeta?.from}
            -
            {workersMeta?.to}
            {' '}
            of
            {' '}
            {workersMeta?.total}
          </div>
          <button type="button" onClick={handleNext} disabled={page === totalPages}>Next</button>
        </div>
      </div>
      <DeleteModal
        openObj={showModal}
        onApproveClose={handleModalAccept}
        onClose={() => setShowModal(false)}
        mainContent={modalText()}
      />
    </Container>
  );
}

export default Workers;

function IdCell({ item }: {item: WorkersTableData}) {
  return (
    <div className="id-cell">
      {item.code}
    </div>
  );
}
function CreatedAt({ item }: {item: WorkersTableData}) {
  const today = new Date(item.created_at);
  const formatedDate = today.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: '2-digit' });
  return (
    <div>
      {formatedDate}
    </div>
  );
}
type TooltipWrapperProps = {
  children: JSX.Element
  tooltipText: string
}
function TooltipWrapper({ children, tooltipText }: TooltipWrapperProps) {
  return (
    <Whisper
      controlId="control-id-container"
      preventOverflow
      trigger="hover"
      speaker={(
        <Tooltip>
          {tooltipText}
        </Tooltip>
          )}
      placement="top"
    >
      {children}
    </Whisper>
  );
}
type ActionsCellProps = {
  onDotsClick: () => void
  onEditClick: () => void
  onRemoveClick: () => void
  onFeedUpdate: () => void
  onProvidersClick: () => void
}
function ActionsCell({
  onRemoveClick, onDotsClick, onEditClick, onFeedUpdate, onProvidersClick,
}: ActionsCellProps) {
  return (
    <StyledActionCell>
      <TooltipWrapper tooltipText="Providers">
        <button type="button" onClick={onProvidersClick} className="feed-update">
          <PeoplesIcon height={16} width={16} />
        </button>
      </TooltipWrapper>
      <TooltipWrapper tooltipText="Update feed">
        <button type="button" onClick={onFeedUpdate} className="feed-update">
          <CloudReflashIcon height={16} width={16} />
        </button>
      </TooltipWrapper>
      <TooltipWrapper tooltipText="Open Inventory">
        <button type="button" className="dots" onClick={onDotsClick}>
          <PersonsSvg />
        </button>
      </TooltipWrapper>
      <TooltipWrapper tooltipText="Edit worker">
        <button type="button" onClick={onEditClick}>
          <img src={squareEdit} alt="edit" />
        </button>
      </TooltipWrapper>
      <TooltipWrapper tooltipText="Remove worker">
        <button type="button" className="remove-bin" onClick={onRemoveClick}>
          <BinSvg fill="#747474" stroke="#747474" />
        </button>
      </TooltipWrapper>
    </StyledActionCell>
  );
}

const StyledActionCell = styled.div`
  display: flex;
  align-items: center;
  .dots {
    margin-top: 12px;
    > * {
      width: 24px;
    }
   }
  .remove-bin {
    height: 20px;
    margin-top: 5px;
  }
  .feed-update {
    margin-top: 5px;
  }
`;

const columns: WorkersTableColumns[] = [
  {
    label: 'DEALER ID',
    key: 'item_id',
    width: 120,
  },
  {
    label: 'DEALERSHIP NAME',
    key: 'workership_name',
  },
  {
    label: 'PRIMARY EMAIL',
    key: 'primary_email',
  },
  {
    label: 'CREATED DATE',
    key: 'created_at',
  },
  {
    label: '',
    key: 'action',
    width: 180,
  },
];
const Container = styled.div`
  padding-top: 33px;
    padding-right: 39px;
  .head {
    .title {
      color: ${(props) => props.theme.secondaryTextColor};
      font-size: 20px;
      font-weight: bold;
    }
    .control {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      .buttons-container {
        display: flex;
        .remove-btn-container {
          margin-right: 20px;
        }
      }
    }
    .create-button {
      .primary {
        text-transform: unset;
        border-radius: 4px;
      }
    }
  }
   .table-wrap {
     margin-top: 24px;
     background-color: #fff;
     border-radius: 8px;
     box-shadow: 0 5px 5px rgba(0, 0, 0, 0.29);

     .table-header {
       padding: 8px;
       display: flex;
       justify-content: space-between; 
       padding-right: 20px;
       .arrow {
         background-image: url("data:image/svg+xml,%3Csvg width='24' fill='%23747474' height='24' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath stroke='null' id='svg_1' d='m1.1752,9.02285l8.56872,13.25122c1.29027,1.99536 3.37455,1.99536 4.66483,0l8.56872,-13.25122c2.08428,-3.22327 0.59551,-8.74887 -2.34895,-8.74887l-17.13744,0c-2.94446,0 -4.40015,5.5256 -2.31587,8.74887z'/%3E%3C/g%3E%3C/svg%3E");
         height: 15px;
         width: 16px;
         background-size: 6px 5px;
         background-repeat: no-repeat;
         background-position: 3px 5px;
         margin-left: 2px;
       }
       .header-checkbox {
         display: flex;
         align-items: center;
         .rs-checkbox-checker {
           padding: 14px;
         }
       }
       .header-filters {
         display: flex;
         align-items: center;
         cursor: pointer;
         img {
           width: 24px;
           height: 24px;
         }
       }
     }
     .rs-table-row-header {
       * {
         background-color: #f6f6f6;
       }
       .rs-table-cell-content {
         color: ${(props) => props.theme.secondaryTextColor};
       }
     }
     #table-wrapper {
         margin: 0;
         color: ${(props) => props.theme.secondaryTextColor};
       .rs-table-cell {
         border-bottom: 1px solid #c1c1c1;
         }
       }
     .table-footer {
       padding: 8px;
       display: flex;
       justify-content: space-between;
       color: ${(props) => props.theme.secondaryTextColor};
       font-size: 14px;
       button {
         color: #c1c1c1;
         font-weight: bold;
       }
     }
     .id-cell {
       color: ${(props) => props.theme.primaryColor};
     }
   }
`;

const IconWrapper = styled.div`
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid ${(props) => props.theme.primaryColor};
  transition: all ease 0.2s;
  :hover {
    border: 2px solid ${(props) => props.theme.primaryColor};
  }
  img {
    width: 36px;
    height: 36px;
  }
`;
