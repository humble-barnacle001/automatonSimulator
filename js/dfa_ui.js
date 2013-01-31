var dfa_ui = (function() {
  var self = null;
  var dfa = null;
  var container = null;
  var stateCounter = 0;
  
  var connectionClicked = function(connection) {
    // TODO: Change this to edit the transition?
    jsPlumb.detach(connection);
  };
  
  var connectionAdded = function(info) {
    var inputChar = prompt('Read what input character on transition?', 'A');
    if (inputChar === null) {
      jsPlumb.detach(info.connection);
      return;
    }
    if (inputChar.length > 1) {
      inputChar = inputChar[0]; // Only accept single character
    }
    info.connection.setPaintStyle({strokeStyle:"#0a0"});
    info.connection.getOverlay("label").setLabel(inputChar);
    dfa.addTransition(info.sourceId, inputChar, info.targetId);
  };
  
  var domReadyInit = function() {
    jsPlumb.Defaults.Container = $('#machineGraph');
    self.setGraphContainer($('#machineGraph'));
    
    jsPlumb.importDefaults({
      ConnectorZIndex: 5,
      Endpoint : ["Dot", {radius:2}],
      HoverPaintStyle : {strokeStyle:"#42a62c", lineWidth:2},
      ConnectionOverlays : [
        ["Arrow", {
          location: 1,
          id: "arrow",
          length: 14,
          foldback: 0.8
          }],
        ["Label", {label:"FOO", id:"label"}]
      ]
    });
    
    jsPlumb.bind("click", connectionClicked);
    jsPlumb.bind("jsPlumbConnection", connectionAdded);
    
    // Setup handling 'enter' in test string box
    $('#testString').keyup(function(event) {if (event.which === 13) {$('#testBtn').trigger('click');}});
    
    // Setup handling for accept state changes
    container.on('change', 'input[type="checkbox"].isAccept', function(event) {
      var cBox = $(this);
      var stateId = cBox.closest('div.state').attr('id');
      if (cBox.prop('checked')) {
        dfa.addAcceptState(stateId);
      } else {
        dfa.removeAcceptState(stateId);
      }
    });
    
    // Setup the Start State
    var startState = makeState('start');
    container.append(startState);
    makeStatePlumbing(startState);
    dfa.setStartState('start');
  };
  
  var makeState = function(stateId) {
    return $('<div id="' + stateId + '" class="state"></div>')
      .append('<input id="' + stateId+'_isAccept' + '" type="checkbox" class="isAccept" value="true" title="Accept" />')
      .append(stateId)
      .append('<div class="plumbSource">&nbsp;</div>');
  };
  
  var makeStatePlumbing = function(state) {
    var source = state.find('.plumbSource');
    jsPlumb.makeSource(source, {
      parent: state,
      anchor: "Continuous",
      connector: ["StateMachine", {curviness:20}],
      connectorStyle: {strokeStyle:"#00a", lineWidth:2},
      maxConnections: 5,
      onMaxConnections:function(info, e) {
        alert("Maximum connections (" + info.maxConnections + ") reached");
      }
    });

    jsPlumb.makeTarget(state, {
      dropOptions: {hoverClass: "dragHover"},
      anchor: "Continuous"
    });
  };
  
  return {
    init: function() {
      self = this;
      dfa = new DFA();
      $(domReadyInit);
      return self;
    },
    
    setDFA: function(newDFA) {
      dfa = newDFA;
      return self;
    },
    
    setGraphContainer: function(newContainer) {
      container = newContainer;
      return self;
    },
    
    addState: function() {
      // Add state to UI
      var state = makeState('s' + stateCounter++);
      container.append(state);
      jsPlumb.draggable(state, {containment:"parent"});
      makeStatePlumbing(state);
      // Do nothing to model
      return self;
    },
    
    removeState: function(state) {
      // Remove state from UI
      // Remove all transitions from model touching this state
      return self;
    },
    
    test: function(input) {
      var accepts = dfa.accepts(input);
      $('#testResult').html(accepts ? 'Accepted' : 'Rejected').effect('highlight', {color: accepts ? '#bfb' : '#fbb'}, 1000);
      return self;
    }
  };
})().init();

