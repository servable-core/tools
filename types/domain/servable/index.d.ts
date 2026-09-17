export default class Servable {
    App: any;
    hydrate({ servableConfig, engine, app }: {
        servableConfig: any;
        engine: any;
        app: any;
    }): Promise<void>;
}
