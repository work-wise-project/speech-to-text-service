export const measureTime = async <T>(operation: string, callback: () => Promise<T>): Promise<T> => {
    const startTime = new Date().getTime();
    const result = await callback();
    const endTime = new Date().getTime();

    console.log(`finished ${operation} in ${((endTime - startTime) / 1000).toFixed(2)}s`);

    return result;
};
