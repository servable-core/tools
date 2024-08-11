export const ProtocolEnum = {
  Index: {
    id: 'index'
  },
  Main: {
    id: 'main'
  },
  License: {
    id: 'license'
  },
  Assets: {
    id: 'assets',
    Icon: {
      id: 'icon',
      parents: ['assets'],
      variants: {
        x2: '@2x',
        x3: '@3x'
      },
      mimeTypes: {
        SVG: 'image/svg+xml',
        PNG: 'image/png'
      },
    },
    Thumbnail: {
      id: 'thumbnail',
      parents: ['assets'],
      variants: {
        x2: '@2x',
        x3: '@3x'
      },
    },
    Cover: {
      id: 'cover',
      parents: ['assets'],
      variants: {
        x2: '@2x',
        x3: '@3x'
      },
    },
  },
  LiveClasses: {
    id: 'liveClasses'
  },
  Managed: {
    Classes: {
      id: 'classes',
      parents: ['managed']
    },
  },
  Target: {
    id: 'target',
    Class: {
      id: 'class',
      parents: ['target'],
      Index: {
        id: 'index',
        parents: ['class'],
      },
      Protocols: {
        id: 'protocols',
        parents: ['class']
      },
    },
    Routes: {
      id: 'routes',
      parents: ['target'],
    },
    Triggers: {
      id: 'triggers',
      parents: ['target'],
      beforeSave: {
        id: 'beforeSave',
        parents: ['target', 'triggers']
      },
      afterSave: {
        id: 'afterSave',
        parents: ['target', 'triggers']
      },
      beforeDelete: {
        id: 'beforeDelete',
        parents: ['target', 'triggers']
      },
      afterDelete: {
        id: 'afterDelete',
        parents: ['target', 'triggers']
      },
      beforeFind: {
        id: 'beforeFind',
        parents: ['target', 'triggers']
      },
      afterFind: {
        id: 'afterFind',
        parents: ['target', 'triggers']
      }
    },
  },
  Functions: {
    id: 'functions',
  },
  Routes: {
    id: 'functions',
  },
  Lib: {
    id: 'lib',
  },
  Schema: {
    id: 'schema'
  },
  BeforeInit: {
    id: 'beforeInit',
    Index: {
      id: 'index',
      parents: ['beforeInit'],
    }
  },
  AfterInit: {
    id: 'afterInit',
    Index: {
      id: 'index',
      parents: ['afterInit'],
    }
  },
  System: {
    id: 'system',
    Docker: {
      id: 'docker',
      parents: ['system'],
      DockerCompose: {
        id: 'index',
        parents: ['system', 'docker'],
      }
    },
  },
  Config: {
    id: 'config',
    Conditions: {
      id: 'conditions',
      parents: ['config']
    },
    Entries: {
      id: 'entries',
      parents: ['config']
    },
    Groups: {
      id: 'groups',
      parents: ['config']
    },
  },
  Seed: {
    id: 'seed',
    Index: {
      id: 'index',
      parents: ['seed']
    },
  },
}

export const ClassEnum = {
  Index: {
    id: 'index'
  },
  Class: {
    id: 'class',
    Index: {
      id: 'index',
      parents: ['class']
    },
    Protocols: {
      id: 'protocols',
      parents: ['class']
    },
  },
  Lib: {
    id: 'lib',
  },
  Seed: {
    id: 'seed',
    Index: {
      id: 'index',
      parents: ['seed']
    },
    Ref: {
      id: 'ref',
      parents: ['seed']
    },
    Executor: {
      id: 'executor',
      parents: ['seed']
    },
    Transformer: {
      id: 'transformer',
      parents: ['seed']
    },
    Validator: {
      id: 'validator',
      parents: ['seed']
    },
  },
  Functions: {
    id: 'functions'
  },
  Triggers: {
    id: 'triggers',
    beforeSave: {
      id: 'beforeSave',
      parents: ['triggers']
    },
    afterSave: {
      id: 'afterSave',
      parents: ['triggers']
    },
    beforeDelete: {
      id: 'beforeDelete',
      parents: ['triggers']
    },
    afterDelete: {
      id: 'afterDelete',
      parents: ['triggers']
    },
    beforeFind: {
      id: 'beforeFind',
      parents: ['triggers']
    },
    afterFind: {
      id: 'afterFind',
      parents: ['triggers']
    }
  }
}
export const SchemaEnum = {
  Index: {
    id: 'index'
  },
  ClassLevelPermissions: {
    id: 'classLevelPermissions'
  },
  Migration: {
    id: 'migration',
    Index: {
      id: 'index',
      parents: ['migration']
    },
    Up: {
      id: 'up',
      Index: {
        id: 'index',
        parents: ['migration', 'up']
      },
      parents: ['migration']
    },
    Down: {
      id: 'down',
      Index: {
        id: 'index',
        parents: ['migration', 'down']
      },
      parents: ['migration']
    },
  },
}

export const DataTemplateType = {
  Protocol: 'protocol',
  Class: 'class',
  Schema: 'schema',
}
