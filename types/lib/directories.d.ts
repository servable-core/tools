export default perform;
declare function perform({ path, exlusions }: {
    path: any;
    exlusions?: any[];
}): Promise<{
    name: string;
    stat: fs.Stats;
}[]>;
import fs from 'fs';
