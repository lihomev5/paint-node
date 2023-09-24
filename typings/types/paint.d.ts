



declare namespace paint {
    /** 普通对象 */
    export type AnyObject =  Record<string, any>

    interface MappingConfig {
        app: import ("express").Express;
        path: string;
    }
}