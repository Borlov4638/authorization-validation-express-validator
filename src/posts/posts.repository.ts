

export const postsRepository ={
    commentsSortingQuery(sortBy:string,sortDirection:number):{}{
        switch (sortBy){
            case "id":
                return {id: sortDirection}
            case "content":
                return {content: sortDirection}
            case "createdAt":
                return {createdAt: sortDirection}
            default:
                return {createdAt: 1}
        }

    }
}