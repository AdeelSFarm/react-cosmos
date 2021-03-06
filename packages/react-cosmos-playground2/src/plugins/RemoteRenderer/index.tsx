import React from 'react';
import { createPlugin } from 'react-plugin';
import { Message } from 'react-cosmos-shared2/util';
import { CoreSpec } from '../Core/public';
import { MessageHandlerSpec } from '../MessageHandler/public';
import { RendererCoreSpec } from '../RendererCore/public';
import { NotificationsSpec } from '../Notifications/public';
import { RemoteRendererSpec } from './public';
import { RemoteRendererContext } from './shared';
import { RemoteButton } from './RemoteButton';

const { onLoad, on, namedPlug, register } = createPlugin<RemoteRendererSpec>({
  name: 'remoteRenderer'
});

on<MessageHandlerSpec>('messageHandler', {
  rendererResponse: (context: RemoteRendererContext, msg: Message) => {
    const rendererCore = context.getMethodsOf<RendererCoreSpec>('rendererCore');
    rendererCore.receiveResponse(msg);
  }
});

on<RendererCoreSpec>('rendererCore', {
  request: (context: RemoteRendererContext, msg: Message) => {
    postRendererRequest(context, msg);
  }
});

onLoad(context => {
  // Discover remote renderers by asking all to announce themselves
  postRendererRequest(context, {
    type: 'pingRenderers'
  });
});

namedPlug('globalAction', 'remoteRenderer', ({ pluginContext }) => {
  const { getMethodsOf } = pluginContext;
  const core = getMethodsOf<CoreSpec>('core');
  const notifications = getMethodsOf<NotificationsSpec>('notifications');
  return (
    <RemoteButton
      devServerOn={core.isDevServerOn()}
      webRendererUrl={core.getWebRendererUrl()}
      pushNotification={notifications.pushTimedNotification}
    />
  );
});

export { register };

function postRendererRequest(context: RemoteRendererContext, msg: Message) {
  const msgHandler = context.getMethodsOf<MessageHandlerSpec>('messageHandler');
  msgHandler.postRendererRequest(msg);
}
