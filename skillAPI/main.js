app.post("/blockId", function(req, res) {
    const userRequest = req.body.userRequest;
    const blockId = userRequest.block.id;
  
    return res.send({
      version: "2.0",
      template: {
        outputs: [
          {
            basicCard: {
              title: "블록ID 입니다",
              description: blockId
            }
          }
        ]
      }
    });
  });