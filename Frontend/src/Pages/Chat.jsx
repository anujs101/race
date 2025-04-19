import React from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

const Chat = () => {
    return (
        <div>
            <div className="flex flex-1 flex-row p-4 pt-0 border-2">
                <PanelGroup direction="horizontal" className="w-full">
                    <Panel defaultSize={50} minSize={20}>
                        <div className="h-full p-4">
                            hey
                        </div>
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors">
                        <div className="h-full w-1 mx-auto bg-border rounded-full"></div>
                    </PanelResizeHandle>
                    <Panel defaultSize={50} minSize={20}>
                        <div className="h-full p-4">
                            rehan
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    )
}

export default Chat
