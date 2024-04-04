import API_TAGS from '@constants/apiTags';
import {createAppApi} from '@utils/createAppApi';

export const authApi = createAppApi(
  'authReducer',
  {
    endpoints: builder => ({
      getMe: builder.query({
        query: () => '/me',
        providesTags: [API_TAGS.ME],
      }),
      updateMe: builder.mutation({
        query: data => ({
          url: '/me',
          method: 'PUT',
          body: data,
        }),
      }),
      refreshToken: builder.mutation({
        query: () => ({
          url: '/refresh',
          method: 'POST',
        }),
      }),
      socialLogin: builder.mutation({
        query: data => ({
          url: '/socialLogin',
          method: 'POST',
          body: data,
        }),
      }),
      login: builder.mutation({
        query: ({username, password, rememberMe, role}) => ({
          url: `/${role}/login`,
          method: 'POST',
          body: {username, password, rememberMe},
        }),
      }),
      recovery: builder.mutation({
        query: ({role, email}) => ({
          url: `/${role}/recovery`,
          method: 'POST',
          body: {email},
        }),
      }),
      logout: builder.mutation({
        query: () => ({
          url: '/logout',
          method: 'POST',
        }),
      }),
    }),
  },
  {
    tagTypes: [API_TAGS.ME],
  },
);

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateMeMutation,
  useSocialLoginMutation,
  useLoginMutation,
  useRecoveryMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi;
