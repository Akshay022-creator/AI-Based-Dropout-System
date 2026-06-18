import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Academic, ApproveResourceBody, AuthResponse, CreateGrievanceBody, CreateResourceBody, CreateTimetableBody, ErrorResponse, FacultyDashboard, Grievance, HealthStatus, ListGrievancesParams, ListProfilesParams, ListResourcesParams, ListTimetablesParams, LoginBody, MessageResponse, ParentDashboard, ProctorMessage, Profile, Resource, SendProctorMessageBody, StudentDashboard, SubjectRecord, Timetable, UpdateAcademicBody, UpdateGrievanceStatusBody, UpdateProfileBody } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Login with email and password
 */
export declare const getLoginUrl: () => string;
export declare const login: (loginBody: LoginBody, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginBody>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Login with email and password
 */
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
/**
 * @summary Logout current user
 */
export declare const getLogoutUrl: () => string;
export declare const logout: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
 * @summary Logout current user
 */
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
/**
 * @summary Get current authenticated user
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<Profile>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current authenticated user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List profiles (faculty/admin)
 */
export declare const getListProfilesUrl: (params?: ListProfilesParams) => string;
export declare const listProfiles: (params?: ListProfilesParams, options?: RequestInit) => Promise<Profile[]>;
export declare const getListProfilesQueryKey: (params?: ListProfilesParams) => readonly ["/api/profiles", ...ListProfilesParams[]];
export declare const getListProfilesQueryOptions: <TData = Awaited<ReturnType<typeof listProfiles>>, TError = ErrorType<unknown>>(params?: ListProfilesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProfiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProfiles>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProfilesQueryResult = NonNullable<Awaited<ReturnType<typeof listProfiles>>>;
export type ListProfilesQueryError = ErrorType<unknown>;
/**
 * @summary List profiles (faculty/admin)
 */
export declare function useListProfiles<TData = Awaited<ReturnType<typeof listProfiles>>, TError = ErrorType<unknown>>(params?: ListProfilesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProfiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get a user profile
 */
export declare const getGetProfileUrl: (id: number) => string;
export declare const getProfile: (id: number, options?: RequestInit) => Promise<Profile>;
export declare const getGetProfileQueryKey: (id: number) => readonly [`/api/profiles/${number}`];
export declare const getGetProfileQueryOptions: <TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getProfile>>>;
export type GetProfileQueryError = ErrorType<unknown>;
/**
 * @summary Get a user profile
 */
export declare function useGetProfile<TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a user profile
 */
export declare const getUpdateProfileUrl: (id: number) => string;
export declare const updateProfile: (id: number, updateProfileBody: UpdateProfileBody, options?: RequestInit) => Promise<Profile>;
export declare const getUpdateProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        id: number;
        data: BodyType<UpdateProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
    id: number;
    data: BodyType<UpdateProfileBody>;
}, TContext>;
export type UpdateProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateProfile>>>;
export type UpdateProfileMutationBody = BodyType<UpdateProfileBody>;
export type UpdateProfileMutationError = ErrorType<unknown>;
/**
 * @summary Update a user profile
 */
export declare const useUpdateProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        id: number;
        data: BodyType<UpdateProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProfile>>, TError, {
    id: number;
    data: BodyType<UpdateProfileBody>;
}, TContext>;
/**
 * @summary Get student academic record
 */
export declare const getGetAcademicsUrl: (studentId: number) => string;
export declare const getAcademics: (studentId: number, options?: RequestInit) => Promise<Academic>;
export declare const getGetAcademicsQueryKey: (studentId: number) => readonly [`/api/academics/${number}`];
export declare const getGetAcademicsQueryOptions: <TData = Awaited<ReturnType<typeof getAcademics>>, TError = ErrorType<unknown>>(studentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAcademics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAcademics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAcademicsQueryResult = NonNullable<Awaited<ReturnType<typeof getAcademics>>>;
export type GetAcademicsQueryError = ErrorType<unknown>;
/**
 * @summary Get student academic record
 */
export declare function useGetAcademics<TData = Awaited<ReturnType<typeof getAcademics>>, TError = ErrorType<unknown>>(studentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAcademics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update academic record (faculty)
 */
export declare const getUpdateAcademicsUrl: (studentId: number) => string;
export declare const updateAcademics: (studentId: number, updateAcademicBody: UpdateAcademicBody, options?: RequestInit) => Promise<Academic>;
export declare const getUpdateAcademicsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAcademics>>, TError, {
        studentId: number;
        data: BodyType<UpdateAcademicBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAcademics>>, TError, {
    studentId: number;
    data: BodyType<UpdateAcademicBody>;
}, TContext>;
export type UpdateAcademicsMutationResult = NonNullable<Awaited<ReturnType<typeof updateAcademics>>>;
export type UpdateAcademicsMutationBody = BodyType<UpdateAcademicBody>;
export type UpdateAcademicsMutationError = ErrorType<unknown>;
/**
 * @summary Update academic record (faculty)
 */
export declare const useUpdateAcademics: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAcademics>>, TError, {
        studentId: number;
        data: BodyType<UpdateAcademicBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAcademics>>, TError, {
    studentId: number;
    data: BodyType<UpdateAcademicBody>;
}, TContext>;
/**
 * @summary Get per-subject attendance and marks for a student
 */
export declare const getGetSubjectRecordsUrl: (studentId: number) => string;
export declare const getSubjectRecords: (studentId: number, options?: RequestInit) => Promise<SubjectRecord[]>;
export declare const getGetSubjectRecordsQueryKey: (studentId: number) => readonly [`/api/academics/${number}/subjects`];
export declare const getGetSubjectRecordsQueryOptions: <TData = Awaited<ReturnType<typeof getSubjectRecords>>, TError = ErrorType<unknown>>(studentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSubjectRecords>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSubjectRecords>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSubjectRecordsQueryResult = NonNullable<Awaited<ReturnType<typeof getSubjectRecords>>>;
export type GetSubjectRecordsQueryError = ErrorType<unknown>;
/**
 * @summary Get per-subject attendance and marks for a student
 */
export declare function useGetSubjectRecords<TData = Awaited<ReturnType<typeof getSubjectRecords>>, TError = ErrorType<unknown>>(studentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSubjectRecords>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List timetables
 */
export declare const getListTimetablesUrl: (params?: ListTimetablesParams) => string;
export declare const listTimetables: (params?: ListTimetablesParams, options?: RequestInit) => Promise<Timetable[]>;
export declare const getListTimetablesQueryKey: (params?: ListTimetablesParams) => readonly ["/api/timetables", ...ListTimetablesParams[]];
export declare const getListTimetablesQueryOptions: <TData = Awaited<ReturnType<typeof listTimetables>>, TError = ErrorType<unknown>>(params?: ListTimetablesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTimetables>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTimetables>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTimetablesQueryResult = NonNullable<Awaited<ReturnType<typeof listTimetables>>>;
export type ListTimetablesQueryError = ErrorType<unknown>;
/**
 * @summary List timetables
 */
export declare function useListTimetables<TData = Awaited<ReturnType<typeof listTimetables>>, TError = ErrorType<unknown>>(params?: ListTimetablesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTimetables>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a timetable entry (faculty)
 */
export declare const getCreateTimetableUrl: () => string;
export declare const createTimetable: (createTimetableBody: CreateTimetableBody, options?: RequestInit) => Promise<Timetable>;
export declare const getCreateTimetableMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTimetable>>, TError, {
        data: BodyType<CreateTimetableBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTimetable>>, TError, {
    data: BodyType<CreateTimetableBody>;
}, TContext>;
export type CreateTimetableMutationResult = NonNullable<Awaited<ReturnType<typeof createTimetable>>>;
export type CreateTimetableMutationBody = BodyType<CreateTimetableBody>;
export type CreateTimetableMutationError = ErrorType<unknown>;
/**
 * @summary Create a timetable entry (faculty)
 */
export declare const useCreateTimetable: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTimetable>>, TError, {
        data: BodyType<CreateTimetableBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTimetable>>, TError, {
    data: BodyType<CreateTimetableBody>;
}, TContext>;
/**
 * @summary Update a timetable entry (faculty)
 */
export declare const getUpdateTimetableUrl: (id: number) => string;
export declare const updateTimetable: (id: number, createTimetableBody: CreateTimetableBody, options?: RequestInit) => Promise<Timetable>;
export declare const getUpdateTimetableMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTimetable>>, TError, {
        id: number;
        data: BodyType<CreateTimetableBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTimetable>>, TError, {
    id: number;
    data: BodyType<CreateTimetableBody>;
}, TContext>;
export type UpdateTimetableMutationResult = NonNullable<Awaited<ReturnType<typeof updateTimetable>>>;
export type UpdateTimetableMutationBody = BodyType<CreateTimetableBody>;
export type UpdateTimetableMutationError = ErrorType<unknown>;
/**
 * @summary Update a timetable entry (faculty)
 */
export declare const useUpdateTimetable: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTimetable>>, TError, {
        id: number;
        data: BodyType<CreateTimetableBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTimetable>>, TError, {
    id: number;
    data: BodyType<CreateTimetableBody>;
}, TContext>;
/**
 * @summary Delete a timetable entry (faculty)
 */
export declare const getDeleteTimetableUrl: (id: number) => string;
export declare const deleteTimetable: (id: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getDeleteTimetableMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTimetable>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteTimetable>>, TError, {
    id: number;
}, TContext>;
export type DeleteTimetableMutationResult = NonNullable<Awaited<ReturnType<typeof deleteTimetable>>>;
export type DeleteTimetableMutationError = ErrorType<unknown>;
/**
 * @summary Delete a timetable entry (faculty)
 */
export declare const useDeleteTimetable: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTimetable>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteTimetable>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List learning resources (NoteGo)
 */
export declare const getListResourcesUrl: (params?: ListResourcesParams) => string;
export declare const listResources: (params?: ListResourcesParams, options?: RequestInit) => Promise<Resource[]>;
export declare const getListResourcesQueryKey: (params?: ListResourcesParams) => readonly ["/api/resources", ...ListResourcesParams[]];
export declare const getListResourcesQueryOptions: <TData = Awaited<ReturnType<typeof listResources>>, TError = ErrorType<unknown>>(params?: ListResourcesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listResources>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listResources>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListResourcesQueryResult = NonNullable<Awaited<ReturnType<typeof listResources>>>;
export type ListResourcesQueryError = ErrorType<unknown>;
/**
 * @summary List learning resources (NoteGo)
 */
export declare function useListResources<TData = Awaited<ReturnType<typeof listResources>>, TError = ErrorType<unknown>>(params?: ListResourcesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listResources>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Upload a learning resource (student)
 */
export declare const getCreateResourceUrl: () => string;
export declare const createResource: (createResourceBody: CreateResourceBody, options?: RequestInit) => Promise<Resource>;
export declare const getCreateResourceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createResource>>, TError, {
        data: BodyType<CreateResourceBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createResource>>, TError, {
    data: BodyType<CreateResourceBody>;
}, TContext>;
export type CreateResourceMutationResult = NonNullable<Awaited<ReturnType<typeof createResource>>>;
export type CreateResourceMutationBody = BodyType<CreateResourceBody>;
export type CreateResourceMutationError = ErrorType<unknown>;
/**
 * @summary Upload a learning resource (student)
 */
export declare const useCreateResource: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createResource>>, TError, {
        data: BodyType<CreateResourceBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createResource>>, TError, {
    data: BodyType<CreateResourceBody>;
}, TContext>;
/**
 * @summary Approve or reject a resource (faculty)
 */
export declare const getApproveResourceUrl: (id: number) => string;
export declare const approveResource: (id: number, approveResourceBody: ApproveResourceBody, options?: RequestInit) => Promise<Resource>;
export declare const getApproveResourceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveResource>>, TError, {
        id: number;
        data: BodyType<ApproveResourceBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approveResource>>, TError, {
    id: number;
    data: BodyType<ApproveResourceBody>;
}, TContext>;
export type ApproveResourceMutationResult = NonNullable<Awaited<ReturnType<typeof approveResource>>>;
export type ApproveResourceMutationBody = BodyType<ApproveResourceBody>;
export type ApproveResourceMutationError = ErrorType<unknown>;
/**
 * @summary Approve or reject a resource (faculty)
 */
export declare const useApproveResource: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveResource>>, TError, {
        id: number;
        data: BodyType<ApproveResourceBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approveResource>>, TError, {
    id: number;
    data: BodyType<ApproveResourceBody>;
}, TContext>;
/**
 * @summary Delete a resource (faculty/admin)
 */
export declare const getDeleteResourceUrl: (id: number) => string;
export declare const deleteResource: (id: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getDeleteResourceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteResource>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteResource>>, TError, {
    id: number;
}, TContext>;
export type DeleteResourceMutationResult = NonNullable<Awaited<ReturnType<typeof deleteResource>>>;
export type DeleteResourceMutationError = ErrorType<unknown>;
/**
 * @summary Delete a resource (faculty/admin)
 */
export declare const useDeleteResource: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteResource>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteResource>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List grievances (faculty/admin)
 */
export declare const getListGrievancesUrl: (params?: ListGrievancesParams) => string;
export declare const listGrievances: (params?: ListGrievancesParams, options?: RequestInit) => Promise<Grievance[]>;
export declare const getListGrievancesQueryKey: (params?: ListGrievancesParams) => readonly ["/api/grievances", ...ListGrievancesParams[]];
export declare const getListGrievancesQueryOptions: <TData = Awaited<ReturnType<typeof listGrievances>>, TError = ErrorType<unknown>>(params?: ListGrievancesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGrievances>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGrievances>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGrievancesQueryResult = NonNullable<Awaited<ReturnType<typeof listGrievances>>>;
export type ListGrievancesQueryError = ErrorType<unknown>;
/**
 * @summary List grievances (faculty/admin)
 */
export declare function useListGrievances<TData = Awaited<ReturnType<typeof listGrievances>>, TError = ErrorType<unknown>>(params?: ListGrievancesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGrievances>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Submit a grievance (student)
 */
export declare const getCreateGrievanceUrl: () => string;
export declare const createGrievance: (createGrievanceBody: CreateGrievanceBody, options?: RequestInit) => Promise<Grievance>;
export declare const getCreateGrievanceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGrievance>>, TError, {
        data: BodyType<CreateGrievanceBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createGrievance>>, TError, {
    data: BodyType<CreateGrievanceBody>;
}, TContext>;
export type CreateGrievanceMutationResult = NonNullable<Awaited<ReturnType<typeof createGrievance>>>;
export type CreateGrievanceMutationBody = BodyType<CreateGrievanceBody>;
export type CreateGrievanceMutationError = ErrorType<unknown>;
/**
 * @summary Submit a grievance (student)
 */
export declare const useCreateGrievance: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGrievance>>, TError, {
        data: BodyType<CreateGrievanceBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createGrievance>>, TError, {
    data: BodyType<CreateGrievanceBody>;
}, TContext>;
/**
 * @summary Update grievance status (faculty/admin)
 */
export declare const getUpdateGrievanceStatusUrl: (id: number) => string;
export declare const updateGrievanceStatus: (id: number, updateGrievanceStatusBody: UpdateGrievanceStatusBody, options?: RequestInit) => Promise<Grievance>;
export declare const getUpdateGrievanceStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGrievanceStatus>>, TError, {
        id: number;
        data: BodyType<UpdateGrievanceStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateGrievanceStatus>>, TError, {
    id: number;
    data: BodyType<UpdateGrievanceStatusBody>;
}, TContext>;
export type UpdateGrievanceStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateGrievanceStatus>>>;
export type UpdateGrievanceStatusMutationBody = BodyType<UpdateGrievanceStatusBody>;
export type UpdateGrievanceStatusMutationError = ErrorType<unknown>;
/**
 * @summary Update grievance status (faculty/admin)
 */
export declare const useUpdateGrievanceStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGrievanceStatus>>, TError, {
        id: number;
        data: BodyType<UpdateGrievanceStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateGrievanceStatus>>, TError, {
    id: number;
    data: BodyType<UpdateGrievanceStatusBody>;
}, TContext>;
/**
 * @summary Student dashboard summary
 */
export declare const getGetStudentDashboardUrl: () => string;
export declare const getStudentDashboard: (options?: RequestInit) => Promise<StudentDashboard>;
export declare const getGetStudentDashboardQueryKey: () => readonly ["/api/dashboard/student"];
export declare const getGetStudentDashboardQueryOptions: <TData = Awaited<ReturnType<typeof getStudentDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStudentDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStudentDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStudentDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof getStudentDashboard>>>;
export type GetStudentDashboardQueryError = ErrorType<unknown>;
/**
 * @summary Student dashboard summary
 */
export declare function useGetStudentDashboard<TData = Awaited<ReturnType<typeof getStudentDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStudentDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Faculty dashboard summary
 */
export declare const getGetFacultyDashboardUrl: () => string;
export declare const getFacultyDashboard: (options?: RequestInit) => Promise<FacultyDashboard>;
export declare const getGetFacultyDashboardQueryKey: () => readonly ["/api/dashboard/faculty"];
export declare const getGetFacultyDashboardQueryOptions: <TData = Awaited<ReturnType<typeof getFacultyDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFacultyDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFacultyDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFacultyDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof getFacultyDashboard>>>;
export type GetFacultyDashboardQueryError = ErrorType<unknown>;
/**
 * @summary Faculty dashboard summary
 */
export declare function useGetFacultyDashboard<TData = Awaited<ReturnType<typeof getFacultyDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFacultyDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Parent dashboard summary with children status
 */
export declare const getGetParentDashboardUrl: () => string;
export declare const getParentDashboard: (options?: RequestInit) => Promise<ParentDashboard>;
export declare const getGetParentDashboardQueryKey: () => readonly ["/api/dashboard/parent"];
export declare const getGetParentDashboardQueryOptions: <TData = Awaited<ReturnType<typeof getParentDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getParentDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getParentDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetParentDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof getParentDashboard>>>;
export type GetParentDashboardQueryError = ErrorType<unknown>;
/**
 * @summary Parent dashboard summary with children status
 */
export declare function useGetParentDashboard<TData = Awaited<ReturnType<typeof getParentDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getParentDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List proctor chat messages for current user
 */
export declare const getListProctorMessagesUrl: () => string;
export declare const listProctorMessages: (options?: RequestInit) => Promise<ProctorMessage[]>;
export declare const getListProctorMessagesQueryKey: () => readonly ["/api/proctor-messages"];
export declare const getListProctorMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listProctorMessages>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProctorMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProctorMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProctorMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listProctorMessages>>>;
export type ListProctorMessagesQueryError = ErrorType<unknown>;
/**
 * @summary List proctor chat messages for current user
 */
export declare function useListProctorMessages<TData = Awaited<ReturnType<typeof listProctorMessages>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProctorMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a proctor message
 */
export declare const getSendProctorMessageUrl: () => string;
export declare const sendProctorMessage: (sendProctorMessageBody: SendProctorMessageBody, options?: RequestInit) => Promise<ProctorMessage>;
export declare const getSendProctorMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendProctorMessage>>, TError, {
        data: BodyType<SendProctorMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendProctorMessage>>, TError, {
    data: BodyType<SendProctorMessageBody>;
}, TContext>;
export type SendProctorMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendProctorMessage>>>;
export type SendProctorMessageMutationBody = BodyType<SendProctorMessageBody>;
export type SendProctorMessageMutationError = ErrorType<unknown>;
/**
 * @summary Send a proctor message
 */
export declare const useSendProctorMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendProctorMessage>>, TError, {
        data: BodyType<SendProctorMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendProctorMessage>>, TError, {
    data: BodyType<SendProctorMessageBody>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map