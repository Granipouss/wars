/**
 * Can be serialized as JSON and recreated with that JSON.
 *
 * This is used to have multiple object synced between clients.
 */
export interface WithState<TState> {
    /**
     * A plain object that can be sent as JSON for sync purposes.
     */
    get state(): TState;
}

/**
 * Instance of an object from the database.
 */
export interface WithData<TData, Type extends string> {
    /**
     * Type of the item in the database.
     *
     * Will be used to fetch all shared data.
     */
    readonly type: Type;

    /**
     * Shared unchanging data from the database.
     */
    get data(): TData;
}
