

import {
    IPosts,
    IGetPost,
    IGetVacancies,
    IGetFeedbacks,
    IQuery,
    IGetInstagramPosts,
} from "./types";
import qs from "qs";
import { LoginData, RegistrationData } from "@/data-stores/TypesApp";
import { clearUserInfoFromLocalStorage, setupUserInfoToLocalStorage } from "@/utils/utils";
import { Course } from "@/types";

const api_url = process.env.NEXT_PUBLIC_STRAPI_API_URL

type FetchMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface IFetchHeaders {
    [key: string]: string;
}

const fetchWithTimeout = (
    url: RequestInfo,
    options: RequestInit,
    timeout: number
): Promise<any> => {
    console.log("fetchWithTimeout", url);
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout error")), timeout)
        ),
    ]);
};

export class ApiService {
    public getVacancies(): Promise<IGetVacancies> {
        return this.makeRequest<IGetVacancies>(`${api_url}/api/jobs`, "GET");
    }

    public getFeedbacks(q?: IQuery): Promise<IGetFeedbacks> {
        const defaultQuery: IQuery = {
            pagination: {
                page: 2,
                pageSize: 3,
            },
            sort: ["publishedAt:desc"],
        };
        const query = q ? qs.stringify(q) : qs.stringify(defaultQuery);
        return this.makeRequest<IGetFeedbacks>(
            `${api_url}/api/fecks?${query}`,
            "GET"
        );
    }

    public getInstagramPosts(q?: IQuery): Promise<IGetInstagramPosts> {
        return this.makeRequest<IGetInstagramPosts>(
            `${api_url}/inssts`,
            "GET"
        );
    }

    public getPost(id: string): Promise<IGetPost> {
        return this.makeRequest<IGetPost>(
            `${api_url}/posts/${id}?populate=adminior.img,mainImg`,
            "GET"
        );
    }

    public getPosts(limit: number): Promise<IPosts> {
        return this.makeRequest<IPosts>(
            `${api_url
            }/posts?populate=administrator,administrator.img,mainImpagination[limit]=${limit}`,
            "GET"
        );
    }

    public getProduct(): Promise<Course[]> {
        return this.makeRequest<Course[]>(
            `${api_url
            }/courses?populate=*`,
            "GET"
        );
    }

    public createLoginRequest = (
        jwt: string | null,
        loginData: LoginData | undefined
    ) => {
        if (jwt && !loginData) {
            return fetch(`${api_url}/users/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });
        }
        if (loginData) {
            return fetch(`${api_url}/auth/local`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            });
        }
        throw { error: "Invalid login request" };
    };



    private async makeRequest<TResponse>(
        url: string,
        method?: FetchMethod,
        requestBody?: object | FormData,
        headerOptions?: object
    ): Promise<TResponse> {
        const body = !(requestBody instanceof FormData)
            ? JSON.stringify(requestBody)
            : requestBody;
        const requestHeaders = headerOptions || {};

        const headers: IFetchHeaders = {
            mode: "no-cors",

            accept: "application/json",
            'Access-Control-Allow-Origin': '*',
            ...requestHeaders,
        };

        if (!(requestBody instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetchWithTimeout(
            url,
            {
                method,
                headers,
                body,
            },
            15000
        );

        if (response.ok) {
            const resJson = await response.json();
            return resJson;
        } else {
            throw await response.json();
        }
    }




}
