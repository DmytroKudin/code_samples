import { useMemo } from 'react';
import {
  Route, Routes, Navigate, Link, useLocation,
} from 'react-router-dom';
import { getToken, roleHasAccess } from '../helpers';
import AdminLayout from '../Layouts/AdminLayout';
import AddUnit from '../pages/AddUnit';
import AdminLogin from '../pages/AdminLogin';
import AdminUserCreation from '../pages/AdminUserCreation';
import AdminUsers from '../pages/AdminUsers';
import BillingHistory from '../pages/Billing/BillingHistory';
import AddFund from '../pages/Billing/AddFund';
import WorkerCreation from '../pages/WorkerCreation';
import Workers from '../pages/Workers';
import ProviderCreation from '../pages/ProviderCreation';
import EditUnit from '../pages/EditUnit';
import Feeds from '../pages/Feeds';
import Location from '../pages/Location';
import Login from '../pages/Login';
import AuthLayout from '../Layouts/AuthLayout';
import RolesTable from '../pages/RolesTable';
import Planr from '../pages/SettingPages/Planr';
import SettingsCSV from '../pages/SettingPages/SettingsCSV';
import SettingsIntegrations from '../pages/SettingPages/SettingsIntegrations';
import SettingsOverlay from '../pages/SettingPages/SettingsOverlay';
import SettingsUsers from '../pages/SettingPages/SettingsUsers';
import SettingsLocation from '../pages/SettingPages/SettingsLocation';
import RolePage from '../pages/RolePage';
import Showrooms from '../pages/Showrooms';
import { getMeRequest } from '../store/auth/actions';
import {
  BillingRoles, PlanrRoles, SettingRoles, SupperAdminRoles,
} from '../store/constants';
import Pages from './pages';
import InventoryManager from '../pages/InventoryManager';
import MainLayout from '../Layouts/MainLayout';
import Registration from '../pages/Registration';
import Providers from '../pages/Providers';
import ResetPassword from '../pages/ResetPassword';
import { useGetSelectedWorker } from '../hooks/getWorkersHook';

function PageNotFound() {
  return (
    <div>
      <h1>{'Page doesn\'t exist'}</h1>
      <div>
        <Link to={Pages.home}>
          Home
        </Link>
      </div>
    </div>
  );
}

type ProtectedRouteType = {
  isAllowed: boolean,
  redirectPath?: string,
  element: JSX.Element
}

function ProtectedRoute({ isAllowed, redirectPath = '/', element }: ProtectedRouteType) {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return element;
}

function RoutesComponent() {
  const isLoggedIn = getToken();
  const location = useLocation();

  const userRequest = getMeRequest();
  const user = userRequest?.data?.data;
  const selectedWorker = useGetSelectedWorker();

  const routes: RouteType[] = [
    {
      path: Pages.inventoryManager,
      element: <InventoryManager />,
      systemPermissions: [],
      redirect: Pages.login,
    },
    {
      path: Pages.editUnit,
      element: <EditUnit />,
      systemPermissions: [],
      redirect: Pages.login,
    },
    {
      path: Pages.addUnit,
      element: <AddUnit />,
      systemPermissions: [],
      redirect: Pages.login,
    },
    {
      path: Pages.addUnitPure,
      element: <AddUnit />,
      systemPermissions: [],
      redirect: Pages.login,
    },
    {
      path: Pages.billingAddFunds,
      element: <AddFund />,
      systemPermissions: [roleHasAccess(user?.role, BillingRoles)],
    },
    {
      path: Pages.billingHistory,
      element: <BillingHistory />,
      systemPermissions: [roleHasAccess(user?.role, BillingRoles)],
    },
  ];

  const routesMapper = (route: RouteType) => (
    <Route
      element={(
        <ProtectedRoute
          isAllowed={route?.systemPermissions?.every(Boolean) || userRequest.isLoading}
          redirectPath={route.redirect || Pages.home}
          element={route.element}
        />
)}
      path={route.path}
      key={route.path}
    />
  );

  const mappedAuthRoutes = useMemo(() => (
    <Route element={<AuthLayout />}>
      {authRoutes.map((el) => routesMapper(el))}
    </Route>
  ), [authRoutes, location, isLoggedIn]);
  const mappedRoutes = useMemo(() => (
    <Route element={<MainLayout />}>
      {routes.map((el) => routesMapper({
        ...el,
        systemPermissions: [!!isLoggedIn, ...el.systemPermissions],
      }))}
    </Route>
  ), [routes, isLoggedIn, location]);

  const mappedAdminRoutes = useMemo(() => (
    <Route element={<MainLayout />}>
      {workerRoutes.map((el) => routesMapper({
        ...el,
        systemPermissions: [roleHasAccess(user?.role, SettingRoles), !!isLoggedIn],
      }))}
    </Route>
  ), [routes, isLoggedIn, location, user?.role]);
  const mappedPlanRoutes = useMemo(() => (
    <Route element={<MainLayout />}>
      {planRoutes.map((el) => routesMapper({
        ...el,
        systemPermissions: [roleHasAccess(selectedWorker?.id ? selectedWorker?.role : user?.role, PlanrRoles), !!isLoggedIn],
      }))}
    </Route>
  ), [routes, isLoggedIn, location, user?.role]);

  const mappedSuperAdminRoutes = useMemo(() => (
    <Route element={<AdminLayout />}>
      {superAdminRoutes.map((el) => routesMapper({
        ...el,
        systemPermissions: [roleHasAccess(user?.role, SupperAdminRoles), !!isLoggedIn],
        redirect: Pages.inventoryManager,
      }))}
    </Route>
  ), [routes, isLoggedIn, location, user?.role]);

  if (userRequest.isLoading) {
    return null;
  }

  return (
    <Routes>
      {mappedAuthRoutes}
      {mappedRoutes}
      {mappedAdminRoutes}
      {mappedPlanRoutes}
      {mappedSuperAdminRoutes}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default RoutesComponent;

type RouteType = {
  path: string,
  element: JSX.Element,
  systemPermissions: Array<boolean>
  redirect?: string
}

const planRoutes: RouteType[] = [
  {
    path: Pages.PlanrSetting,
    element: <Planr />,
    systemPermissions: [],
  },
  {
    path: Pages.PlanrProfileFromSetting,
    element: <Planr />,
    systemPermissions: [],
  },
  {
    path: Pages.PlanrSettingTabs,
    element: <Planr />,
    systemPermissions: [],
  },
];
const workerRoutes: RouteType[] = [
  {
    path: Pages.LocationSetting,
    element: <SettingsLocation />,
    systemPermissions: [],
  },
  {
    path: Pages.CSVSetting,
    element: <SettingsCSV />,
    systemPermissions: [],
  },
  {
    path: Pages.IntegrationsSetting,
    element: <SettingsIntegrations />,
    systemPermissions: [],
  },
  {
    path: Pages.OverlaySetting,
    element: <SettingsOverlay />,
    systemPermissions: [],
  },
  {
    path: Pages.UsersSetting,
    element: <SettingsUsers />,
    systemPermissions: [],
  },
  {
    path: Pages.location,
    element: <Location />,
    systemPermissions: [],
  },
  {
    path: Pages.editLocation,
    element: <Location />,
    systemPermissions: [],
  },
];

const authRoutes: RouteType[] = [
  {
    path: Pages.login,
    element: <Login />,
    systemPermissions: [],
  },
  {
    path: Pages.adminLogin,
    element: <AdminLogin />,
    systemPermissions: [],
  },
  {
    path: Pages.home,
    element: <Login />,
    systemPermissions: [],
  },
  {
    path: Pages.resetPassword,
    element: <ResetPassword />,
    systemPermissions: [],
  },
  {
    path: Pages.registration,
    element: <Registration />,
    systemPermissions: [],
  },
];

const superAdminRoutes: RouteType[] = [
  {
    path: Pages.workerCreation,
    element: <WorkerCreation />,
    systemPermissions: [],
  },
  {
    path: Pages.workerEdit,
    element: <WorkerCreation />,
    systemPermissions: [],
  },
  {
    path: Pages.workersPage,
    element: <Workers />,
    systemPermissions: [],
  },
  {
    path: Pages.providersPage,
    element: <Providers />,
    systemPermissions: [],
  },
  {
    path: Pages.providerCreation,
    element: <ProviderCreation />,
    systemPermissions: [],
  },
  {
    path: Pages.providerEdit,
    element: <ProviderCreation />,
    systemPermissions: [],
  },
  {
    path: Pages.adminUsersPage,
    element: <AdminUsers />,
    systemPermissions: [],
  },
  {
    path: Pages.adminUserCreation,
    element: <AdminUserCreation />,
    systemPermissions: [],
  },
  {
    path: Pages.adminUserEdit,
    element: <AdminUserCreation />,
    systemPermissions: [],
  },
  {
    path: Pages.feedsPage,
    element: <Feeds />,
    systemPermissions: [],
  },
  {
    path: Pages.showroomsPage,
    element: <Showrooms />,
    systemPermissions: [],
  },
  {
    path: Pages.rolesPage,
    element: <RolesTable />,
    systemPermissions: [],
  },
  {
    path: Pages.rolePage,
    element: <RolePage />,
    systemPermissions: [],
  },
];
