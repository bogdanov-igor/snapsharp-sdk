import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SnapSharpApi implements ICredentialType {
  name = 'snapSharpApi';
  displayName = 'SnapSharp API';
  documentationUrl = 'https://snapsharp.dev/docs/authentication';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      placeholder: 'sk_live_...',
      description: 'Your SnapSharp API key. Get it at https://snapsharp.dev/dashboard/api-keys',
    },
  ];
}
