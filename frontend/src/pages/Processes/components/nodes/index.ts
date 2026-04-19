import StartNode from './StartNode';
import EndNode from './EndNode';
import ApprovalNode from './ApprovalNode';
import TaskNode from './TaskNode';
import AcceptNode from './AcceptNode';
import EvaluateNode from './EvaluateNode';
import CallbackNode from './CallbackNode';
import EscalateNode from './EscalateNode';

export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  approvalNode: ApprovalNode,
  taskNode: TaskNode,
  acceptNode: AcceptNode,
  evaluateNode: EvaluateNode,
  callbackNode: CallbackNode,
  escalateNode: EscalateNode,
};
