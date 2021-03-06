export interface INoteLinks {
  currentNoteEndpoint: string;
  parentNoteEndpoint: string;
  childNoteEndpoint: string;
}

export interface INote {
  id: string;
  uid: string;
  content: string;
  createdAt: string;
  archived: boolean;
  tags: string[];
  _links: INoteLinks;
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
