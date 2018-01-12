require 'rails_helper'

RSpec.describe ControllerHelper::FilterHelper, type: :helper do
  it 'should reject empty queries' do
    expect(runValidations([])).to eq ['should contain at least 1 query']
  end
  
  it 'should reject unrecognized types' do
    expect(runValidations([{ 'type' => 'foobar' }])).to include a_hash_including('type' => 'type should be one of: [group, leaf, side, note]')
  end
  
  it 'should reject unrecognized conjunctions' do
    result = runValidations([
      { 'type' => 'group', 'attribute' => 'type', 'condition' => 'equals', 'values' => ['Codex Taorminae 1'] },
      { 'type' => 'group', 'attribute' => 'type', 'condition' => 'equals', 'values' => ['Codex Taorminae 2'], 'conjunction' => 'XOR' },
      { 'type' => 'group', 'attribute' => 'type', 'condition' => 'equals', 'values' => ['Codex Taorminae 3'] }
    ])
    expect(result).to include a_hash_including('conjunction' => 'conjunction should be one of : [AND, OR]')
  end
  
  it 'should reject empty query values' do
    result = runValidations([
      { 'type' => 'group', 'attribute' => 'type', 'condition' => 'equals', 'values' => [] },
      { 'type' => 'group', 'attribute' => 'type', 'condition' => 'equals', 'values' => ['Codex Taorminae 2'], 'conjunction' => 'OR' },
      { 'type' => 'group', 'attribute' => 'type', 'condition' => 'equals', 'values' => ['Codex Taorminae 3'] }
    ])
    expect(result).to include a_hash_including('values' => 'query value cannot be empty')
  end
  
  describe 'Group queries' do
    it 'should reject invalid attribute for groups' do
      result = runValidations([
        { 'type' => 'group', 'attribute' => 'waahoo', 'condition' => 'waahoo', 'values' => ['Quire'] }
      ])
      expect(result).to include a_hash_including('attribute' => 'valid attributes for group: [type, title]')
    end
    
    it 'should accept valid parameters for type' do
      ['equals', 'not equals'].each do |op|
        result = runValidations([
          { 'type' => 'group', 'attribute' => 'type', 'condition' => op, 'values' => ['Quire'] }
        ])
        expect(result).to be_empty
      end
    end
    
    it 'should reject invalid conditions for type' do
      result = runValidations([
        { 'type' => 'group', 'attribute' => 'type', 'condition' => 'contains', 'values' => ['Quire'] }
      ])
      expect(result).to include a_hash_including('condition' => 'valid conditions for group attribute type : [equals, not equals]')
    end
    
    it 'should accept valid parameters for title' do
      ['equals', 'not equals', 'contains', 'not contains'].each do |op|
        result = runValidations([
          { 'type' => 'group', 'attribute' => 'title', 'condition' => op, 'values' => ['Codex Taorminae'] }
        ])
        expect(result).to be_empty
      end
    end
    
    it 'should reject invalid conditions for title' do
      result = runValidations([
        { 'type' => 'group', 'attribute' => 'title', 'condition' => 'waahoo', 'values' => ['Codex Taorminae'] }
      ])
      expect(result).to include a_hash_including('condition' => "valid conditions for group attribute title : [equals, not equals, contains, not contains]")
    end
  end
  
  describe 'Leaf queries' do
    it 'should reject invalid attribute for leafs' do
      result = runValidations([
        { 'type' => 'leaf', 'attribute' => 'waahoo', 'condition' => 'equals', 'values' => ['3'] }
      ])
      expect(result).to include a_hash_including('attribute' => 'valid attributes for leaf: [type, material, conjoined_to, conjoined_leaf_order, attached_above, attached_below, stub]')
    end
    
    it 'should accept valid parameters for conditions' do
      ['type', 'material', 'conjoined_to', 'conjoined_leaf_order', 'attached_above', 'attached_below', 'stub'].each do |attribute|
        result = runValidations([
          { 'type' => 'leaf', 'attribute' => attribute, 'condition' => 'eq', 'values' => ['Some Value'] }
        ])
        expect(result).to include a_hash_including('condition' => "valid conditions for leaf attribute #{attribute} : [equals, not equals]")
      end
    end
  end
  
  describe 'Side queries' do
    it 'should reject invalid attribute for sides' do
      result = runValidations([
        { 'type' => 'side', 'attribute' => 'waahoo', 'condition' => 'equals', 'values' => ['3r'] }
      ])
      expect(result).to include a_hash_including('attribute' => 'valid attributes for side: [folio_number, texture, script_direction, uri]')
    end
    
    it 'should reject invalid conditions for texture and script_direction' do
      ['texture', 'script_direction'].each do |attribute|
        result = runValidations([
          { 'type' => 'side', 'attribute' => attribute, 'condition' => 'waahoo', 'values' => ['value'] }
        ])
        expect(result).to include a_hash_including('condition' => "valid conditions for side attribute #{attribute} : [equals, not equals]")
      end
    end
    
    it 'should accept valid conditions for texture and script_direction' do
      ['texture', 'script_direction'].each do |attribute|
        ['equals', 'not equals'].each do |condition|
          result = runValidations([
            { 'type' => 'side', 'attribute' => attribute, 'condition' => condition, 'values' => ['value'] }
          ])
          expect(result).to be_empty
        end
      end
    end
    
    it 'should reject invalid conditions for folio_number and uri' do
      ['folio_number', 'uri'].each do |attribute|
        result = runValidations([
          { 'type' => 'side', 'attribute' => attribute, 'condition' => 'waahoo', 'values' => ['value'] }
        ])
        expect(result).to include a_hash_including('condition' => "valid conditions for side attribute #{attribute} : [equals, not equals, contains, not contains]")
      end
    end
    
    it 'should accept valid conditions for folio_number and uri' do
      ['folio_number', 'uri'].each do |attribute|
        ['equals', 'not equals', 'contains', 'not contains'].each do |condition|
          result = runValidations([
            { 'type' => 'side', 'attribute' => attribute, 'condition' => condition, 'values' => ['value'] }
          ])
          expect(result).to be_empty
        end
      end
    end
  end
  
  describe 'Note queries' do
    it 'should reject invalid attribute for sides' do
      result = runValidations([
        { 'type' => 'note', 'attribute' => 'waahoo', 'condition' => 'equals', 'values' => ['hint'] }
      ])
      expect(result).to include a_hash_including('attribute' => 'valid attributes for note: [title, type, description]')
    end
    
    it 'should reject invalid conditions for type' do
      result = runValidations([
        { 'type' => 'note', 'attribute' => 'type', 'condition' => 'waahoo', 'values' => ['hint'] }
      ])
      expect(result).to include a_hash_including('condition' => 'valid conditions for note attribute type : [equals, not equals]')
    end
    
    it 'should accept valid conditions for type' do
      ['equals', 'not equals'].each do |condition|
        result = runValidations([
          { 'type' => 'note', 'attribute' => 'type', 'condition' => condition, 'values' => ['hint'] }
        ])
        expect(result).to be_empty
      end
    end
    
    it 'should reject invalid conditions for title and description' do
      ['title', 'description'].each do |attribute|
        result = runValidations([
          { 'type' => 'note', 'attribute' => attribute, 'condition' => 'waahoo', 'values' => ['hint'] }
        ])
        expect(result).to include a_hash_including('condition' => "valid conditions for note attribute #{attribute} : [equals, not equals, contains, not contains]")
      end
    end
    
    it 'should accept valid conditions for title and description' do
      ['title', 'description'].each do |attribute|
        ['equals', 'not equals', 'contains', 'not contains'].each do |condition|
          result = runValidations([
            { 'type' => 'note', 'attribute' => attribute, 'condition' => condition, 'values' => ['hint'] }
          ])
          expect(result).to be_empty
        end
      end
    end
  end
end
