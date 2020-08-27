import React, {
    useEffect,
    useRef,
} from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import throttle from 'lodash/throttle';
import Loading from '../ui/Loading';
import Header from './Cells/Header';
import { getLogs, setRenderLimitIdx } from '../../actions/queryLogs';
import { QUERY_LOGS_PAGE_LIMIT, QUERY_LOGS_PAGE_SIZE } from '../../helpers/constants';
import Row from './Cells';
import { isScrolledIntoView } from '../../helpers/helpers';

const InfiniteTable = ({
    isLoading,
    items,
    isSmallScreen,
    setDetailedDataCurrent,
    setButtonType,
    setModalOpened,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const renderLimitIdx = useSelector((state) => state.queryLogs.renderLimitIdx);
    const loader = useRef(null);

    const {
        isEntireLog,
        processingGetLogs,
    } = useSelector((state) => state.queryLogs, shallowEqual);

    useEffect(() => {
        const THROTTLE_TIME = 100;
        const EVENT_TYPE = 'scroll';

        const listener = throttle(() => {
            if (loader.current && isScrolledIntoView(loader.current)) {
                dispatch(setRenderLimitIdx(renderLimitIdx + QUERY_LOGS_PAGE_SIZE));

                const isDivisible = renderLimitIdx % QUERY_LOGS_PAGE_LIMIT === 0;

                if (isDivisible) {
                    dispatch(getLogs());
                }
            }
        }, THROTTLE_TIME);

        window.addEventListener(EVENT_TYPE, listener);
        return () => {
            window.removeEventListener(EVENT_TYPE, listener);
        };
    }, [renderLimitIdx, loader]);

    const renderRow = (row, idx) => <Row
                    key={idx}
                    rowProps={row}
                    isSmallScreen={isSmallScreen}
                    setDetailedDataCurrent={setDetailedDataCurrent}
                    setButtonType={setButtonType}
                    setModalOpened={setModalOpened}
            />;

    const loading = isLoading || processingGetLogs;

    return <div className='logs__table' role='grid'>
        {loading && <Loading />}
        <Header />
        {items.length === 0 && !processingGetLogs
            ? <label className="logs__no-data">{t('nothing_found')}</label>
            : <>{items.slice(0, renderLimitIdx).map(renderRow)}
                    {items.length >= renderLimitIdx
                    && !isEntireLog
                    && !loading
                    && <div ref={loader} className="logs__loading text-center">{t('loading_table_status')}</div>}
            </>}
    </div>;
};

InfiniteTable.propTypes = {
    isLoading: propTypes.bool.isRequired,
    items: propTypes.array.isRequired,
    isSmallScreen: propTypes.bool.isRequired,
    setDetailedDataCurrent: propTypes.func.isRequired,
    setButtonType: propTypes.func.isRequired,
    setModalOpened: propTypes.func.isRequired,
};

export default InfiniteTable;
