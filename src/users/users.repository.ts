

export const usersRepository ={
    usersSortingQuery(sortBy:string, sortDirection: number): {}{
        switch(sortBy){
            case 'id':
                return {id: sortDirection}
            case 'login':
                return {login: sortDirection}
            case 'email':
                return {email: sortDirection}
            case 'createdAt':
                return {createdAt: sortDirection}
            default:
                return {createdAt: 1}
        }
    }
}