export const blogsRepository = {
    blogsSortingQuery(sortBy: string, sortDirection: number): {}{

        switch (sortBy){
            case "id":
                return {id: sortDirection}
            case "name":
                return {name: sortDirection}
            case "description":
                return {description: sortDirection}
            case "websiteUrl":
                return {websiteUrl: sortDirection}
            case "isMembership":
                return {isMembership: sortDirection}
            case "createdAt":
                return {createdAt: sortDirection}
            default:
                return {createdAt: 1}
        }
    }
}