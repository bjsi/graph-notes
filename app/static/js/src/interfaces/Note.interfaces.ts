export interface INote {
    id: string;
    content: string;
    createdAt: string;
    archived: boolean;
    tags: string[];
}

export interface IPageLinks {
    currentPageEndpoint: string;
    nextPageEndpoint: string;
    prevPageEndpoint: string;
}

export interface IPaginationInfo {
    currentPage: number;
    itemsPerPage: number;
}

export interface IPaginatedNotes {
    data: INote[];
    _meta: IPaginationInfo;
    _links: IPageLinks;
}