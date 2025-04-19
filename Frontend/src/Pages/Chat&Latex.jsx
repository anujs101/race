import React from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import ChatPage from '../Components/ChatPage'
import LatexViewAndProgram from '../Components/LatexViewAndProgram'

const ChatLatex = () => {
    return (
        <div className="h-[85vh]">
            <div className="h-full">
                <PanelGroup direction="horizontal" className="w-full h-full">
                    <Panel defaultSize={50} minSize={20}>
                        <div className="h-full p-4">
                            <LatexViewAndProgram/>
                        </div>
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors">
                        <div className="h-full w-1 mx-auto bg-border rounded-full"></div>
                    </PanelResizeHandle>
                    <Panel defaultSize={50} minSize={20}>
                        <div className="h-full">
                            <ChatPage />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    )
}

export default ChatLatex
