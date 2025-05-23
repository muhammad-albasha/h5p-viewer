declare module 'h5p-standalone' {
  export default class H5PStandalone {
    constructor(element: HTMLElement | null, options: {
      h5pJsonPath: string;
      frameJs: string;
      frameCss: string;
      [key: string]: any;
    });
    
    then(callback: (result: any) => void): H5PStandalone;
    catch(callback: (error: Error) => void): H5PStandalone;
  }
}